/**
 * Approval Gate Types
 * Types for approval gate decisions and metadata
 */

export type GateStatus = 'approved' | 'requires_approval' | 'rejected';

export type GateType = 'approval' | 'safety' | 'cost' | 'escalation';

export interface ApprovalGateResult {
  status: GateStatus;
  gatesTriggered: GateType[];
  reason: string;
  estimatedCost?: number;
  requiresHumanApproval: boolean;
}

export interface ApprovalRequest {
  taskId: string;
  userId: string;
  prompt: string;
  estimatedCost: number;
  gatesTriggered: GateType[];
  metadata?: Record<string, any>;
}

export interface ApprovalDecision {
  taskId: string;
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  reason?: string;
}
