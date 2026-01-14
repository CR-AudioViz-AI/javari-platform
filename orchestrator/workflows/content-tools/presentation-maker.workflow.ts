/**
 * Presentation Maker Workflow
 * Multi-step AI presentation generation
 */

import type { WorkflowDefinition } from '../schema';

export const presentationMakerWorkflow: WorkflowDefinition = {
  name: 'generate-presentation',
  description: 'AI-powered presentation creation with outline, content, and images',
  version: 1,
  steps: [
    {
      id: 'outline',
      name: 'Generate Outline',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      action: 'generate',
      input: {
        prompt: 'Create a presentation outline for: {{topic}}. Target audience: {{audience}}. Number of slides: {{slideCount}}. Format as JSON with slide titles and key points.',
        systemPrompt: 'You are an expert presentation designer. Create compelling, structured outlines.',
        maxTokens: 500,
        temperature: 0.7,
      },
      onSuccess: 'content',
      cache: true,
      retry: {
        maxAttempts: 2,
        delayMs: 1000,
      },
    },
    {
      id: 'content',
      name: 'Generate Slide Content',
      provider: 'openai',
      model: 'gpt-4o-mini',
      action: 'generate',
      input: {
        prompt: 'For this presentation outline: {{outline.output}}, generate detailed content for each slide including title, bullet points, and speaker notes.',
        maxTokens: 2000,
        temperature: 0.7,
      },
      onSuccess: 'images',
      onFailure: 'fallback-content',
      cache: true,
    },
    {
      id: 'fallback-content',
      name: 'Fallback Content Generation',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      action: 'generate',
      input: {
        prompt: 'For this presentation outline: {{outline.output}}, generate detailed content for each slide.',
        maxTokens: 2000,
      },
      onSuccess: 'images',
    },
    {
      id: 'images',
      name: 'Generate Image Suggestions',
      provider: 'perplexity',
      model: 'sonar',
      action: 'generate',
      input: {
        prompt: 'For this presentation content: {{content.output}}, suggest relevant image search terms for each slide.',
        maxTokens: 300,
      },
      cache: true,
    },
  ],
  settings: {
    maxTotalCost: 0.65,
    timeout: 120000, // 2 minutes
    enableCaching: true,
    requireApproval: false,
  },
};
