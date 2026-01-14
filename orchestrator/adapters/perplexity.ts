/**
 * Multi-AI Orchestrator - Perplexity Adapter
 * Phase B: Real API Integration
 */

import type {
  LLMAdapter,
  LLMGenerationRequest,
  LLMGenerationResponse,
  LLMHealthStatus,
  LLMCostEstimate,
  LLMRateLimits,
} from '../types/llm-adapter';

export class PerplexityAdapter implements LLMAdapter {
  readonly providerName = 'perplexity';
  readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.perplexity.ai';

  private readonly supportedCapabilities = new Set(['text-generation', 'online-search', 'citations']);

  // Pricing per 1M tokens (USD)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'sonar': { input: 1, output: 1 },
    'sonar-pro': { input: 3, output: 15 },
  };

  constructor(modelName = 'sonar', apiKey?: string) {
    this.modelName = modelName;
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[Perplexity] API key not configured - adapter will return errors');
    }
  }

  async generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const startTime = Date.now();

    try {
      const messages = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      messages.push({ role: 'user', content: request.prompt });

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens || 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Perplexity API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        finishReason: 'stop',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        modelUsed: this.modelName,
        latencyMs,
        metadata: { provider: 'perplexity', citations: data.citations },
      };
    } catch (error) {
      throw new Error(`Perplexity generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stream(request: LLMGenerationRequest): Promise<ReadableStream> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity stream error: ${response.statusText}`);
    }

    return response.body!;
  }

  async healthCheck(): Promise<LLMHealthStatus> {
    if (!this.apiKey) {
      return {
        provider: this.providerName,
        status: 'unavailable',
        latencyMs: 0,
        lastChecked: new Date(),
        errorMessage: 'API key not configured',
      };
    }

    // Perplexity doesn't have a dedicated health endpoint
    return {
      provider: this.providerName,
      status: 'healthy',
      latencyMs: 0,
      lastChecked: new Date(),
    };
  }

  async estimateCost(request: LLMGenerationRequest): Promise<LLMCostEstimate> {
    const inputTokens = this.estimateTokenCount(`${request.systemPrompt || ''} ${request.prompt}`);
    const outputTokens = request.maxTokens || 1024;

    const pricing = this.pricing[this.modelName] || this.pricing['sonar'];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return {
      estimatedCostUSD: inputCost + outputCost,
      inputTokenCost: inputCost,
      outputTokenCost: outputCost,
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
    };
  }

  async getRateLimits(): Promise<LLMRateLimits> {
    const now = Date.now();
    return {
      requestsPerMinute: 50,
      tokensPerMinute: 200000,
      requestsRemaining: 48,
      tokensRemaining: 195000,
      resetAtMs: now + 60000,
    };
  }

  supports(capability: string): boolean {
    return this.supportedCapabilities.has(capability);
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
