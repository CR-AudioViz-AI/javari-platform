/**
 * OpenAI Adapter (Phase A - Mocked)
 * Implements LLMAdapter interface for OpenAI GPT models
 */

import type {
  LLMAdapter,
  AICapability,
  GenerationRequest,
  GenerationResponse,
  HealthStatus,
  RateLimitInfo,
  CostEstimate,
} from '../types/llm-adapter';

export class OpenAIAdapter implements LLMAdapter {
  name = 'openai';
  version = '1.0.0';

  /**
   * Check if adapter supports a given capability
   */
  supports(capability: AICapability): boolean {
    const supportedCapabilities: AICapability[] = [
      'text-generation',
      'code-generation',
      'function-calling',
      'json-mode',
    ];
    return supportedCapabilities.includes(capability);
  }

  /**
   * Generate AI content (MOCKED for Phase A)
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate token estimates
    const promptTokens = Math.ceil(request.prompt.length / 4);
    const maxTokens = request.maxTokens || 1000;
    const completionTokens = Math.min(maxTokens, 500); // Mock response size

    // Mock response content
    const mockContent = `[MOCK OpenAI Response] This is a simulated response to: "${request.prompt.substring(0, 50)}..."`;

    const latencyMs = Date.now() - startTime;

    return {
      content: mockContent,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
      model: request.model || 'gpt-4-turbo',
      provider: 'openai',
      latencyMs,
      costUsd: this.calculateMockCost(promptTokens, completionTokens),
      finishReason: 'stop',
      metadata: {
        temperature: request.temperature || 0.7,
        mocked: true,
      },
    };
  }

  /**
   * Health check (MOCKED)
   */
  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const responseTimeMs = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTimeMs,
      lastChecked: new Date().toISOString(),
      message: 'OpenAI adapter operational (mocked)',
    };
  }

  /**
   * Get rate limit info (MOCKED)
   */
  async getRateLimits(): Promise<RateLimitInfo> {
    return {
      requestsPerMinute: 500,
      tokensPerMinute: 150000,
      remaining: 450,
      resetAt: new Date(Date.now() + 60000).toISOString(),
    };
  }

  /**
   * Estimate cost of a request
   */
  async estimateCost(request: GenerationRequest): Promise<CostEstimate> {
    const promptTokens = Math.ceil(request.prompt.length / 4);
    const maxTokens = request.maxTokens || 1000;

    // GPT-4-turbo pricing (approximate)
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;

    const estimatedCostUsd = 
      (promptTokens / 1000) * inputCostPer1k +
      (maxTokens / 1000) * outputCostPer1k;

    return {
      estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(4)),
      basedOn: 'prompt_tokens',
      confidence: 0.9,
    };
  }

  /**
   * Calculate mock cost based on token usage
   */
  private calculateMockCost(promptTokens: number, completionTokens: number): number {
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;

    const cost = 
      (promptTokens / 1000) * inputCostPer1k +
      (completionTokens / 1000) * outputCostPer1k;

    return parseFloat(cost.toFixed(4));
  }
}

// Export singleton instance
export const openaiAdapter = new OpenAIAdapter();
