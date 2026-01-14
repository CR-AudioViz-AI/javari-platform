/**
 * Property Description Generation Workflow
 * AI-powered compelling listing descriptions
 */

import type { WorkflowDefinition } from '../schema';

export const propertyDescriptionWorkflow: WorkflowDefinition = {
  name: 'generate-property-description',
  description: 'Generate compelling property listing description',
  version: 1,
  steps: [
    {
      id: 'description',
      name: 'Generate Description',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      action: 'generate',
      input: {
        prompt: `Create a compelling property listing description for:
Property Type: {{propertyType}}
Bedrooms: {{bedrooms}}
Bathrooms: {{bathrooms}}
Square Feet: {{sqft}}
Key Features: {{features}}
Neighborhood: {{city}}, {{state}}

Write an engaging, professional description that highlights the property's best features and appeals to potential buyers. Focus on lifestyle benefits, unique selling points, and the neighborhood. Keep it under 300 words.`,
        systemPrompt: 'You are an expert real estate copywriter who creates compelling, honest property descriptions that drive interest.',
        maxTokens: 500,
        temperature: 0.8,
      },
      cache: true,
      retry: {
        maxAttempts: 2,
        delayMs: 1000,
      },
    },
  ],
  settings: {
    maxTotalCost: 0.50,
    timeout: 60000,
    enableCaching: true,
  },
};
