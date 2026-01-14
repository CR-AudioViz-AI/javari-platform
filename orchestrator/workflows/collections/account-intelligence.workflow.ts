/**
 * Account Intelligence Workflow
 * Phase II: AI-powered account analysis
 */

import type { WorkflowDefinition } from '../schema';

export const accountIntelligenceWorkflow: WorkflowDefinition = {
  name: 'analyze-collection-account',
  description: 'Comprehensive account intelligence and recommendations',
  version: 1,
  steps: [
    {
      id: 'extract',
      name: 'Extract Data',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      action: 'generate',
      input: {
        prompt: `Extract and normalize key data from this account:
Debtor: {{debtorName}}
Balance: ${{balance}}
Original Creditor: {{originalCreditor}}
State: {{state}}
Age: {{age}} days
Last Contact: {{lastContact}}

Provide: key facts, timeline, communication history summary.`,
        maxTokens: 300,
      },
      onSuccess: 'classify',
    },
    {
      id: 'classify',
      name: 'Classify Stage',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      action: 'generate',
      input: {
        prompt: `Based on: {{extract.output}}

Classify this account stage:
- Early stage (0-60 days)
- Mid stage (60-180 days)
- Late stage (180+ days)
- Legal consideration

And collectability: High/Medium/Low`,
        maxTokens: 150,
      },
      onSuccess: 'recommend',
    },
    {
      id: 'recommend',
      name: 'Recommend Actions',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `Account Classification: {{classify.output}}

Recommend 3 specific next actions for this collection account. Be tactical and compliance-focused.`,
        maxTokens: 200,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.60,
    timeout: 90000,
    enableCaching: false,
  },
};
