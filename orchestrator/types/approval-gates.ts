/**
 * Multi-AI Orchestrator - Approval Gates Types
 * Phase A: Foundation Layer
 */

export type ApprovalStatus = 'approved' | 'requires_approval' | 'denied';

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  check: (request: ApprovalCheckRequest) => ApprovalCheckResult;
}

export interface ApprovalCheckRequest {
  prompt: string;
  systemPrompt?: string;
  estimatedCostUSD: number;
  estimatedTokens: number;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalCheckResult {
  status: ApprovalStatus;
  reason: string;
  triggeredRules: string[];
  requiresHuman: boolean;
}

export interface ApprovalGateConfig {
  rules: ApprovalRule[];
  autoApproveThresholdUSD: number;
  sensitiveKeywords: string[];
}
