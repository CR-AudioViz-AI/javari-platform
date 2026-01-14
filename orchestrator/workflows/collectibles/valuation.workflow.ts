/**
 * AI Valuation Workflow
 * Phase III: Market value estimation
 */

import type { WorkflowDefinition } from '../schema';

export const valuationWorkflow: WorkflowDefinition = {
  name: 'value-collectible',
  description: 'AI-powered market valuation',
  version: 1,
  steps: [
    {
      id: 'research',
      name: 'Research Market Data',
      provider: 'perplexity',
      model: 'sonar',
      action: 'generate',
      input: {
        prompt: `Research current market value for:
Category: {{category}}
Item: {{itemName}}
Year: {{year}}
Condition: {{condition}}

Find recent sales data, auction results, and current listings. Provide specific prices with sources.`,
        maxTokens: 800,
      },
      onSuccess: 'estimate',
    },
    {
      id: 'estimate',
      name: 'Generate Estimate',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `Based on this market research: {{research.output}}

{{valuationRules}}

Provide:
1. Estimated value (single number)
2. Value range (low-high)
3. Confidence (0-1)
4. Key value factors

Respond in JSON format.`,
        maxTokens: 300,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.75,
    timeout: 120000,
    enableCaching: true,
  },
};
