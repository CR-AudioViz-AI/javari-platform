/**
 * Multi-AI Orchestrator - Router Engine
 * Phase A: Foundation Layer
 * 
 * Routes generation requests to appropriate LLM adapters,
 * applies approval gates, and orchestrates the generation flow.
 */

import type { LLMAdapter, LLMGenerationRequest } from '../types/llm-adapter';
import type { GenerationResult, GenerationMetadata } from '../types/generation';
import type { AuditLogEntry } from '../types/audit-log';
import { ApprovalGateEngine } from '../gates/approval';
import { v4 as uuidv4 } from 'uuid';

export interface RouterConfig {
  defaultProvider: string;
  autoApproveThresholdUSD?: number;
  enableAudit?: boolean;
}

export class RouterEngine {
  private adapters: Map<string, LLMAdapter> = new Map();
  private approvalGate: ApprovalGateEngine;
  private config: RouterConfig;
  private auditLog: AuditLogEntry[] = [];

  constructor(config: RouterConfig) {
    this.config = {
      autoApproveThresholdUSD: 1.0,
      enableAudit: true,
      ...config,
    };
    this.approvalGate = new ApprovalGateEngine(this.config.autoApproveThresholdUSD);
  }

  /**
   * Register an LLM adapter with the router
   */
  registerAdapter(provider: string, adapter: LLMAdapter): void {
    this.adapters.set(provider, adapter);
  }

  /**
   * Route a generation request through approval gates and to the appropriate adapter
   */
  async route(
    request: LLMGenerationRequest,
    metadata: GenerationMetadata
  ): Promise<GenerationResult> {
    const requestId = metadata.requestId || uuidv4();
    const provider = this.config.defaultProvider;
    
    // Log request
    this.logAudit({
      eventId: uuidv4(),
      eventType: 'generation_requested',
      timestamp: new Date(),
      userId: metadata.userId,
      provider,
      requestId,
      metadata: { priority: metadata.priority },
    });

    try {
      // Validate request
      this.validateRequest(request);

      // Get adapter
      const adapter = this.adapters.get(provider);
      if (!adapter) {
        throw new Error(`No adapter registered for provider: ${provider}`);
      }

      // Estimate cost
      const costEstimate = await adapter.estimateCost(request);

      // Check approval gate
      const approvalResult = await this.approvalGate.checkApproval({
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        estimatedCostUSD: costEstimate.estimatedCostUSD,
        estimatedTokens: costEstimate.estimatedInputTokens + costEstimate.estimatedOutputTokens,
        userId: metadata.userId,
        metadata: metadata.context,
      });

      if (approvalResult.status === 'requires_approval') {
        // Log approval required
        this.logAudit({
          eventId: uuidv4(),
          eventType: 'generation_denied',
          timestamp: new Date(),
          userId: metadata.userId,
          provider,
          requestId,
          metadata: {
            reason: approvalResult.reason,
            triggeredRules: approvalResult.triggeredRules,
            estimatedCost: costEstimate.estimatedCostUSD,
          },
        });

        return {
          requestId,
          status: 'requires_approval',
          provider,
          model: adapter.modelName,
          error: approvalResult.reason,
        };
      }

      // Log approval
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_approved',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
        costUSD: costEstimate.estimatedCostUSD,
      });

      // Log start
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_started',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
      });

      // Generate
      const startTime = Date.now();
      const response = await adapter.generate(request);
      const latencyMs = Date.now() - startTime;

      // Calculate actual cost (in Phase A, use estimate)
      const actualCost = costEstimate.estimatedCostUSD;

      // Log completion
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_completed',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
        costUSD: actualCost,
        latencyMs,
      });

      return {
        requestId,
        status: 'completed',
        provider,
        model: adapter.modelName,
        content: response.content,
        usage: response.usage,
        costUSD: actualCost,
        latencyMs: response.latencyMs,
        completedAt: new Date(),
      };

    } catch (error) {
      // Log failure
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_failed',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        requestId,
        status: 'failed',
        provider,
        model: this.adapters.get(provider)?.modelName || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate generation request
   */
  private validateRequest(request: LLMGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.maxTokens !== undefined && request.maxTokens < 1) {
      throw new Error('Max tokens must be at least 1');
    }
  }

  /**
   * Get audit log entries (for testing/debugging)
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Log audit event
   */
  private logAudit(entry: AuditLogEntry): void {
    if (this.config.enableAudit) {
      this.auditLog.push(entry);
      // In Phase A, just keep in memory
      // In future phases, this will persist to database
    }
  }

  /**
   * Check health of all registered adapters
   */
  async checkHealth(): Promise<Map<string, any>> {
    const healthResults = new Map();

    for (const [provider, adapter] of this.adapters.entries()) {
      try {
        const health = await adapter.healthCheck();
        healthResults.set(provider, health);
      } catch (error) {
        healthResults.set(provider, {
          provider,
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return healthResults;
  }
}
