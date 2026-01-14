/**
 * Credit Guard Middleware
 * Phase H: Enforce credit limits on workflow execution
 */

import { creditEngine } from '../credits/creditEngine';
import { areCreditsEnabled } from '@/lib/featureFlags/monetization';

export interface WorkflowRequest {
  userId: string;
  communityId?: string;
  workflowId: string;
  estimatedCostUSD: number;
}

export interface CreditGuardResult {
  allowed: boolean;
  reason?: string;
  creditsNeeded: number;
  creditsAvailable: number;
}

export async function creditGuard(request: WorkflowRequest): Promise<CreditGuardResult> {
  // Skip if credits not enabled
  if (!areCreditsEnabled()) {
    return {
      allowed: true,
      creditsNeeded: 0,
      creditsAvailable: Infinity,
    };
  }

  const { userId, communityId, estimatedCostUSD } = request;

  // Convert cost to credits
  const creditsNeeded = creditEngine.convertCostToCredits(estimatedCostUSD);

  // Get available credits
  const creditsAvailable = await creditEngine.getUserCredits(userId, communityId);

  // Check if sufficient
  if (creditsAvailable < creditsNeeded) {
    return {
      allowed: false,
      reason: `Insufficient credits. Need ${creditsNeeded}, have ${creditsAvailable}`,
      creditsNeeded,
      creditsAvailable,
    };
  }

  return {
    allowed: true,
    creditsNeeded,
    creditsAvailable,
  };
}

export async function consumeWorkflowCredits(
  userId: string,
  communityId: string | undefined,
  workflowId: string,
  actualCostUSD: number
): Promise<boolean> {
  if (!areCreditsEnabled()) return true;

  const creditsUsed = creditEngine.convertCostToCredits(actualCostUSD);

  return creditEngine.consumeCredits({
    userId,
    communityId,
    delta: creditsUsed,
    reason: 'workflow_execution',
    workflowId,
    costUSD: actualCostUSD,
  });
}
