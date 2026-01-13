/**
 * Orchestrator Router (Phase A)
 * Routes AI requests to appropriate providers with approval gates
 */

import type { GenerationRequest, GenerationResponse } from '../types/generation';
import type { ApprovalGateResult } from '../types/approval-gates';
import type { AuditLogEntry } from '../types/audit-log';
import { openaiAdapter } from '../adapters/openai';
import { evaluateApprovalGate } from '../gates/approval';
import { logAuditEvent } from '../audit/audit-stub';
import crypto from 'crypto';

export interface RouterRequest {
  userId: string;
  request: GenerationRequest;
  workflowId?: string;
  taskId?: string;
}

export interface RouterResponse {
  response: GenerationResponse;
  approvalGate: ApprovalGateResult;
  taskId: string;
}

/**
 * Main router function - Phase A implementation
 */
export async function routeRequest(routerReq: RouterRequest): Promise<RouterResponse> {
  const startTime = Date.now();
  const taskId = routerReq.taskId || generateTaskId();

  try {
    // Step 1: Validate request
    validateRequest(routerReq.request);

    // Step 2: Estimate cost
    const costEstimate = await openaiAdapter.estimateCost(routerReq.request);

    // Step 3: Run approval gate
    const approvalGate = await evaluateApprovalGate(
      routerReq.request,
      costEstimate
    );

    // Step 4: Check if approval required (Phase A - fail fast if approval needed)
    if (approvalGate.requiresHumanApproval) {
      // In Phase A, we don't have approval workflow yet
      // Log and throw error
      const auditEntry = createAuditEntry({
        taskId,
        userId: routerReq.userId,
        workflowId: routerReq.workflowId || null,
        request: routerReq.request,
        provider: 'openai',
        status: 'rejected',
        approvalGate,
        startTime,
      });

      logAuditEvent(auditEntry);

      throw new Error(
        `Request requires approval: ${approvalGate.reason}. Approval workflow not yet implemented in Phase A.`
      );
    }

    // Step 5: Route to OpenAI adapter (Phase A only supports OpenAI)
    const response = await openaiAdapter.generate(routerReq.request);

    // Step 6: Create audit log entry
    const auditEntry = createAuditEntry({
      taskId,
      userId: routerReq.userId,
      workflowId: routerReq.workflowId || null,
      request: routerReq.request,
      provider: 'openai',
      response,
      status: 'success',
      approvalGate,
      startTime,
    });

    logAuditEvent(auditEntry);

    // Step 7: Return response
    return {
      response,
      approvalGate,
      taskId,
    };
  } catch (error) {
    // Log error
    const auditEntry = createAuditEntry({
      taskId,
      userId: routerReq.userId,
      workflowId: routerReq.workflowId || null,
      request: routerReq.request,
      provider: 'openai',
      status: 'failure',
      error: error as Error,
      startTime,
    });

    logAuditEvent(auditEntry);

    throw error;
  }
}

/**
 * Validate generation request
 */
function validateRequest(request: GenerationRequest): void {
  if (!request.prompt || request.prompt.trim().length === 0) {
    throw new Error('Prompt is required and cannot be empty');
  }

  if (request.temperature !== undefined) {
    if (request.temperature < 0 || request.temperature > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
  }

  if (request.maxTokens !== undefined) {
    if (request.maxTokens < 1 || request.maxTokens > 32000) {
      throw new Error('maxTokens must be between 1 and 32000');
    }
  }
}

/**
 * Generate unique task ID
 */
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Create SHA-256 hash of string
 */
function sha256Hash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Create audit log entry
 */
function createAuditEntry(params: {
  taskId: string;
  userId: string;
  workflowId: string | null;
  request: GenerationRequest;
  provider: string;
  response?: GenerationResponse;
  status: 'success' | 'failure' | 'rejected';
  approvalGate?: ApprovalGateResult;
  error?: Error;
  startTime: number;
}): AuditLogEntry {
  const now = new Date().toISOString();
  const completedAt = params.status !== 'rejected' ? now : null;

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId: params.userId,
    workflowId: params.workflowId,
    taskId: params.taskId,
    provider: params.provider,
    model: params.response?.model || params.request.model || 'unknown',
    promptHash: sha256Hash(params.request.prompt),
    promptTokens: params.response?.tokensUsed.prompt || 0,
    systemPromptHash: params.request.systemPrompt 
      ? sha256Hash(params.request.systemPrompt)
      : null,
    responseHash: params.response ? sha256Hash(params.response.content) : '',
    completionTokens: params.response?.tokensUsed.completion || 0,
    totalTokens: params.response?.tokensUsed.total || 0,
    costUsd: params.response?.costUsd || params.approvalGate?.estimatedCost || 0,
    latencyMs: params.response?.latencyMs || (Date.now() - params.startTime),
    gatesTriggered: params.approvalGate?.gatesTriggered || [],
    approvalRequired: params.approvalGate?.requiresHumanApproval || false,
    approvedBy: null,
    approvedAt: null,
    status: params.status,
    errorCode: params.error ? 'ROUTER_ERROR' : null,
    errorMessage: params.error?.message || null,
    requestedAt: new Date(params.startTime).toISOString(),
    startedAt: params.response ? new Date(params.startTime + 10).toISOString() : null,
    completedAt,
    metadata: params.request.metadata || {},
  };
}
