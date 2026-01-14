/**
 * AI Identification Workflow
 * Phase III: Identify collectible from image + category
 */

import type { WorkflowDefinition } from '../schema';

export const identificationWorkflow: WorkflowDefinition = {
  name: 'identify-collectible',
  description: 'AI-powered collectible identification',
  version: 1,
  steps: [
    {
      id: 'identify',
      name: 'Identify Item',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `{{categoryPrompt}}

Analyze the provided image and extract:
1. Specific item name/title
2. Brand/manufacturer
3. Year of production
4. All category-specific attributes
5. Notable features or characteristics

Respond in JSON format with extracted attributes.`,
        systemPrompt: 'You are an expert collectibles identifier with deep knowledge across all categories.',
        maxTokens: 500,
        temperature: 0.3,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.30,
    timeout: 60000,
    enableCaching: false,
  },
};
