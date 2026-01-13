/**
 * Audit Log Types
 * Types for audit logging of AI interactions
 */

export interface AuditLogEntry {
  // Identity
  id: string;
  userId: string;
  workflowId: string | null;
  taskId: string;
  
  // Request
  provider: string;
  model: string;
  promptHash: string;                    // SHA-256 of prompt
  promptTokens: number;
  systemPromptHash: string | null;
  
  // Response
  responseHash: string;                  // SHA-256 of response
  completionTokens: number;
  totalTokens: number;
  
  // Cost & Performance
  costUsd: number;
  latencyMs: number;
  
  // Approval
  gatesTriggered: string[];
  approvalRequired: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  
  // Outcome
  status: 'success' | 'failure' | 'rejected';
  errorCode: string | null;
  errorMessage: string | null;
  
  // Timing
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  
  // Metadata
  metadata: Record<string, any>;
}
