/**
 * Approval Gate Engine (Phase A)
 * Evaluates if AI requests require human approval
 */

import type { ApprovalGateResult, GateType } from '../types/approval-gates';
import type { GenerationRequest } from '../types/generation';
import type { CostEstimate } from '../types/health';

/**
 * Sensitive keywords that trigger approval
 */
const SENSITIVE_KEYWORDS = [
  'resume',
  'legal',
  'medical',
  'health',
  'diagnosis',
  'prescription',
  'contract',
  'lawsuit',
  'confidential',
];

/**
 * Cost threshold for auto-approval (USD)
 */
const COST_THRESHOLD = 1.0;

/**
 * Evaluate if a request requires approval
 */
export async function evaluateApprovalGate(
  request: GenerationRequest,
  costEstimate: CostEstimate
): Promise<ApprovalGateResult> {
  const gatesTriggered: GateType[] = [];
  let requiresApproval = false;
  const reasons: string[] = [];

  // Cost gate
  if (costEstimate.estimatedCostUsd >= COST_THRESHOLD) {
    gatesTriggered.push('cost');
    requiresApproval = true;
    reasons.push(`Estimated cost ($${costEstimate.estimatedCostUsd.toFixed(2)}) exceeds threshold ($${COST_THRESHOLD})`);
  }

  // Content gate - check for sensitive keywords
  const lowerPrompt = request.prompt.toLowerCase();
  const foundKeywords = SENSITIVE_KEYWORDS.filter(keyword => 
    lowerPrompt.includes(keyword)
  );

  if (foundKeywords.length > 0) {
    gatesTriggered.push('approval');
    requiresApproval = true;
    reasons.push(`Contains sensitive keywords: ${foundKeywords.join(', ')}`);
  }

  // Production environment gate (if metadata indicates production)
  if (request.metadata?.environment === 'production') {
    gatesTriggered.push('approval');
    requiresApproval = true;
    reasons.push('Production environment write');
  }

  return {
    status: requiresApproval ? 'requires_approval' : 'approved',
    gatesTriggered,
    reason: requiresApproval 
      ? reasons.join('; ')
      : 'All gates passed - auto-approved',
    estimatedCost: costEstimate.estimatedCostUsd,
    requiresHumanApproval: requiresApproval,
  };
}

/**
 * Check if prompt contains sensitive content
 */
export function containsSensitiveContent(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => lowerPrompt.includes(keyword));
}

/**
 * Get list of sensitive keywords (for testing/debugging)
 */
export function getSensitiveKeywords(): string[] {
  return [...SENSITIVE_KEYWORDS];
}
