/**
 * Multi-AI Orchestrator - Workflow Engine
 * Phase C: Execute multi-step AI workflows with branching, retry, and caching
 */

import { v4 as uuidv4 } from 'uuid';
import { RouterEngine } from '../router/router';
import { db, isSupabaseConfigured } from '../db/client';
import { getCachedResponse, setCachedResponse } from '../cache/cache';
import type { WorkflowDefinition, WorkflowStepResult, WorkflowRunResult, WorkflowStep } from './schema';
import { validateWorkflow, interpolateVariables } from './schema';
import type { LLMGenerationRequest } from '../types/llm-adapter';

export class WorkflowEngine {
  private router: RouterEngine;

  constructor() {
    this.router = new RouterEngine({
      routingStrategy: 'cheapest',
      enableAudit: true,
      enableFallback: true,
    });
  }

  /**
   * Execute a workflow
   */
  async execute(
    workflow: WorkflowDefinition,
    userId: string,
    workflowId?: string
  ): Promise<WorkflowRunResult> {
    // Validate workflow
    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    const runId = uuidv4();
    const startedAt = new Date();
    const steps: WorkflowStepResult[] = [];
    let totalCost = 0;
    let totalLatency = 0;
    let currentStepId = workflow.steps[0]?.id;

    // Create workflow run record
    if (isSupabaseConfigured() && workflowId) {
      try {
        await db.workflowRuns.create({
          id: runId,
          workflow_id: workflowId,
          workflow_name: workflow.name,
          workflow_version: workflow.version,
          user_id: userId,
          status: 'running',
          steps: [],
        });
      } catch (error) {
        console.warn('[WorkflowEngine] Failed to create run record:', error);
      }
    }

    try {
      // Execute steps sequentially with branching support
      const stepResults = new Map<string, WorkflowStepResult>();
      const globalVariables = { ...workflow.variables };

      while (currentStepId) {
        const step = workflow.steps.find(s => s.id === currentStepId);
        if (!step) break;

        // Execute step
        const stepResult = await this.executeStep(
          step,
          userId,
          globalVariables,
          stepResults,
          workflow.settings?.enableCaching !== false
        );

        steps.push(stepResult);
        stepResults.set(step.id, stepResult);

        if (stepResult.costUSD) totalCost += stepResult.costUSD;
        if (stepResult.latencyMs) totalLatency += stepResult.latencyMs;

        // Store step output in variables for interpolation
        globalVariables[step.id] = {
          success: stepResult.status === 'completed',
          output: stepResult.output,
          error: stepResult.error,
        };

        // Determine next step
        if (stepResult.status === 'completed') {
          currentStepId = step.onSuccess || null;
        } else if (stepResult.status === 'failed') {
          currentStepId = step.onFailure || null;
          if (!currentStepId) break; // No fallback, workflow fails
        } else {
          currentStepId = null;
        }

        // Check cost limits
        if (workflow.settings?.maxTotalCost && totalCost > workflow.settings.maxTotalCost) {
          throw new Error(`Workflow exceeded cost limit: $${totalCost.toFixed(4)} > $${workflow.settings.maxTotalCost}`);
        }
      }

      // Determine final status
      const finalStatus = steps.every(s => s.status === 'completed') ? 'completed' : 'failed';
      const finishedAt = new Date();

      // Update workflow run
      if (isSupabaseConfigured() && workflowId) {
        try {
          await db.workflowRuns.update(runId, {
            finished_at: finishedAt,
            status: finalStatus,
            steps: steps,
            total_cost_usd: totalCost,
            total_latency_ms: totalLatency,
          });
        } catch (error) {
          console.warn('[WorkflowEngine] Failed to update run record:', error);
        }
      }

      return {
        runId,
        workflowId,
        workflowName: workflow.name,
        workflowVersion: workflow.version,
        status: finalStatus,
        steps,
        totalCostUSD: totalCost,
        totalLatencyMs: totalLatency,
        startedAt,
        finishedAt,
      };

    } catch (error) {
      // Update workflow run with error
      if (isSupabaseConfigured() && workflowId) {
        try {
          await db.workflowRuns.update(runId, {
            finished_at: new Date(),
            status: 'failed',
            steps: steps,
            error: error instanceof Error ? error.message : 'Unknown error',
            total_cost_usd: totalCost,
            total_latency_ms: totalLatency,
          });
        } catch (updateError) {
          console.warn('[WorkflowEngine] Failed to update run record:', updateError);
        }
      }

      return {
        runId,
        workflowId,
        workflowName: workflow.name,
        workflowVersion: workflow.version,
        status: 'failed',
        steps,
        totalCostUSD: totalCost,
        totalLatencyMs: totalLatency,
        error: error instanceof Error ? error.message : 'Unknown error',
        startedAt,
        finishedAt: new Date(),
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    userId: string,
    variables: Record<string, any>,
    previousResults: Map<string, WorkflowStepResult>,
    enableCaching: boolean
  ): Promise<WorkflowStepResult> {
    const stepResult: WorkflowStepResult = {
      stepId: step.id,
      status: 'running',
      startedAt: new Date(),
    };

    try {
      // Interpolate variables in input
      const prompt = step.input.prompt 
        ? interpolateVariables(step.input.prompt, variables) 
        : '';
      const systemPrompt = step.input.systemPrompt 
        ? interpolateVariables(step.input.systemPrompt, variables) 
        : undefined;

      const request: LLMGenerationRequest = {
        prompt,
        systemPrompt,
        temperature: step.input.temperature ?? 0.7,
        maxTokens: step.input.maxTokens ?? 500,
      };

      stepResult.input = request;

      // Check cache if enabled
      if (enableCaching && step.cache !== false) {
        const cached = await getCachedResponse(request, step.provider);
        if (cached) {
          stepResult.status = 'completed';
          stepResult.output = cached.response;
          stepResult.provider = cached.provider;
          stepResult.model = cached.model;
          stepResult.costUSD = cached.cost;
          stepResult.cached = true;
          stepResult.latencyMs = 0;
          stepResult.completedAt = new Date();
          return stepResult;
        }
      }

      // Execute with router (with retry logic)
      const maxAttempts = step.retry?.maxAttempts || 1;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await this.router.route(
            request,
            {
              requestId: uuidv4(),
              userId,
              timestamp: new Date(),
              priority: 'normal',
            },
            step.provider
          );

          if (result.status === 'completed') {
            stepResult.status = 'completed';
            stepResult.output = result.content;
            stepResult.provider = result.provider;
            stepResult.model = result.model;
            stepResult.costUSD = result.costUSD;
            stepResult.latencyMs = result.latencyMs;
            stepResult.completedAt = new Date();

            // Cache successful result
            if (enableCaching && step.cache !== false) {
              await setCachedResponse(request, result, step.provider);
            }

            return stepResult;
          } else if (result.status === 'requires_approval') {
            throw new Error(`Step ${step.id} requires approval: ${result.error}`);
          } else {
            throw new Error(result.error || 'Generation failed');
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          if (attempt < maxAttempts && step.retry?.delayMs) {
            await new Promise(resolve => setTimeout(resolve, step.retry!.delayMs));
          }
        }
      }

      // All retries failed
      throw lastError || new Error('Step execution failed');

    } catch (error) {
      stepResult.status = 'failed';
      stepResult.error = error instanceof Error ? error.message : 'Unknown error';
      stepResult.completedAt = new Date();
      return stepResult;
    }
  }
}
