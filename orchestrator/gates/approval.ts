/**
 * Multi-AI Orchestrator - Approval Gate Engine
 * Phase A: Foundation Layer
 * 
 * Implements business logic for determining whether AI generation requests
 * require human approval based on cost, content, and policy rules.
 */

import type {
  ApprovalCheckRequest,
  ApprovalCheckResult,
  ApprovalStatus,
  ApprovalRule,
} from '../types/approval-gates';

export class ApprovalGateEngine {
  private readonly autoApproveThresholdUSD: number;
  private readonly sensitiveKeywords: string[];
  private readonly rules: ApprovalRule[];

  constructor(
    autoApproveThresholdUSD = 1.0,
    sensitiveKeywords: string[] = ['resume', 'legal', 'medical', 'confidential', 'private']
  ) {
    this.autoApproveThresholdUSD = autoApproveThresholdUSD;
    this.sensitiveKeywords = sensitiveKeywords.map(k => k.toLowerCase());
    this.rules = this.initializeRules();
  }

  /**
   * Check if a generation request requires approval
   */
  async checkApproval(request: ApprovalCheckRequest): Promise<ApprovalCheckResult> {
    const triggeredRules: string[] = [];
    let status: ApprovalStatus = 'approved';
    let reason = 'Request auto-approved';

    // Check each rule
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const result = rule.check(request);
      if (result.status === 'requires_approval') {
        triggeredRules.push(rule.id);
        status = 'requires_approval';
        reason = result.reason;
        break; // First blocking rule wins
      }
    }

    return {
      status,
      reason,
      triggeredRules,
      requiresHuman: status === 'requires_approval',
    };
  }

  /**
   * Initialize approval rules
   */
  private initializeRules(): ApprovalRule[] {
    return [
      {
        id: 'cost-threshold',
        name: 'Cost Threshold Rule',
        description: `Requires approval for requests estimated to cost more than $${this.autoApproveThresholdUSD}`,
        enabled: true,
        check: (request) => {
          if (request.estimatedCostUSD >= this.autoApproveThresholdUSD) {
            return {
              status: 'requires_approval',
              reason: `Estimated cost ($${request.estimatedCostUSD.toFixed(4)}) exceeds auto-approve threshold ($${this.autoApproveThresholdUSD})`,
              triggeredRules: ['cost-threshold'],
              requiresHuman: true,
            };
          }
          return {
            status: 'approved',
            reason: 'Cost within threshold',
            triggeredRules: [],
            requiresHuman: false,
          };
        },
      },
      {
        id: 'sensitive-content',
        name: 'Sensitive Content Rule',
        description: 'Requires approval for requests containing sensitive keywords',
        enabled: true,
        check: (request) => {
          const combinedText = `${request.prompt} ${request.systemPrompt || ''}`.toLowerCase();
          const foundKeywords = this.sensitiveKeywords.filter(keyword =>
            combinedText.includes(keyword)
          );

          if (foundKeywords.length > 0) {
            return {
              status: 'requires_approval',
              reason: `Contains sensitive keywords: ${foundKeywords.join(', ')}`,
              triggeredRules: ['sensitive-content'],
              requiresHuman: true,
            };
          }
          return {
            status: 'approved',
            reason: 'No sensitive content detected',
            triggeredRules: [],
            requiresHuman: false,
          };
        },
      },
      {
        id: 'token-limit',
        name: 'Token Limit Rule',
        description: 'Requires approval for very large requests (>10,000 tokens)',
        enabled: true,
        check: (request) => {
          const TOKEN_LIMIT = 10000;
          if (request.estimatedTokens > TOKEN_LIMIT) {
            return {
              status: 'requires_approval',
              reason: `Estimated tokens (${request.estimatedTokens}) exceeds limit (${TOKEN_LIMIT})`,
              triggeredRules: ['token-limit'],
              requiresHuman: true,
            };
          }
          return {
            status: 'approved',
            reason: 'Token count within limits',
            triggeredRules: [],
            requiresHuman: false,
          };
        },
      },
    ];
  }

  /**
   * Get all configured rules
   */
  getRules(): ApprovalRule[] {
    return this.rules;
  }

  /**
   * Update auto-approve threshold
   */
  setAutoApproveThreshold(thresholdUSD: number): void {
    // Update the cost-threshold rule
    const costRule = this.rules.find(r => r.id === 'cost-threshold');
    if (costRule) {
      costRule.description = `Requires approval for requests estimated to cost more than $${thresholdUSD}`;
    }
  }

  /**
   * Add or update sensitive keywords
   */
  setSensitiveKeywords(keywords: string[]): void {
    this.sensitiveKeywords.length = 0;
    this.sensitiveKeywords.push(...keywords.map(k => k.toLowerCase()));
  }
}
