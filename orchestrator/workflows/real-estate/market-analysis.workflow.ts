/**
 * Market Analysis Workflow
 * Research comparable sales and market trends
 */

import type { WorkflowDefinition } from '../schema';

export const marketAnalysisWorkflow: WorkflowDefinition = {
  name: 'analyze-real-estate-market',
  description: 'Comprehensive market analysis with comparable properties',
  version: 1,
  steps: [
    {
      id: 'research',
      name: 'Research Market Data',
      provider: 'perplexity',
      model: 'sonar',
      action: 'generate',
      input: {
        prompt: `Research the real estate market for:
Address: {{address}}
Property Type: {{propertyType}}
Bedrooms: {{bedrooms}}
Square Feet: {{sqft}}

Find:
1. Recent comparable sales (last 6 months)
2. Current market trends
3. Average price per square foot
4. Days on market
5. Neighborhood appreciation rates

Provide specific data with sources.`,
        maxTokens: 1000,
      },
      onSuccess: 'analysis',
      cache: true,
    },
    {
      id: 'analysis',
      name: 'Analyze Trends',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      action: 'generate',
      input: {
        prompt: 'Based on this market research: {{research.output}}, provide a concise analysis of pricing strategy and market position for this property.',
        maxTokens: 300,
      },
    },
  ],
  settings: {
    maxTotalCost: 1.00,
    timeout: 120000,
    enableCaching: true,
  },
};
