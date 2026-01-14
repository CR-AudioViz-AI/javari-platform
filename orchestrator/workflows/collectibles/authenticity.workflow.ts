/**
 * AI Authenticity Workflow
 * Phase III: Fraud detection and authenticity verification
 */

import type { WorkflowDefinition } from '../schema';

export const authenticityWorkflow: WorkflowDefinition = {
  name: 'check-authenticity',
  description: 'AI-powered authenticity verification',
  version: 1,
  steps: [
    {
      id: 'analyze',
      name: 'Analyze for Red Flags',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `Analyze this collectible for authenticity markers.

Category: {{category}}
Item: {{itemName}}

Examine:
1. Manufacturing details
2. Labels, stamps, serial numbers
3. Materials and construction
4. Known counterfeit indicators
5. Provenance documentation

Provide:
1. Risk score (0-1, where 1 = high risk)
2. Red flags (concerns)
3. Green flags (positive indicators)
4. Recommendation (authentic/suspicious/needs expert)

Respond in JSON format.`,
        systemPrompt: 'You are an expert authenticator with knowledge of common counterfeits and fraud patterns.',
        maxTokens: 500,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.60,
    timeout: 90000,
    enableCaching: false,
  },
};
