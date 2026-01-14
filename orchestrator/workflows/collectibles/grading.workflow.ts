/**
 * AI Grading Workflow
 * Phase III: Condition assessment
 */

import type { WorkflowDefinition } from '../schema';

export const gradingWorkflow: WorkflowDefinition = {
  name: 'grade-collectible',
  description: 'AI-powered condition grading',
  version: 1,
  steps: [
    {
      id: 'grade',
      name: 'Assess Condition',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `Analyze this collectible's condition using the image(s).

{{gradingRules}}

Assess and provide:
1. Overall grade
2. Specific defects or issues
3. Condition notes for each component
4. Impact on value

Respond in JSON format.`,
        systemPrompt: 'You are an expert grader familiar with industry standards across all collectible categories.',
        maxTokens: 400,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.40,
    timeout: 60000,
    enableCaching: false,
  },
};
