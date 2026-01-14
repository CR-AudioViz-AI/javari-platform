/**
 * Multi-AI Orchestrator - Anthropic Claude Adapter
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

export class AnthropicAdapter implements LLMAdapter {
  readonly providerName = 'anthropic';
  readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.anthropic.com/v1';

  private readonly supportedCapabilities = new Set([
    'text-generation',
    'streaming',
    'vision',
    'long-context',
  ]);

  // Pricing per 1M tokens (USD)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'claude-3-opus': { input: 15, output: 75 },
    'claude-3-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'claude-3-5-haiku': { input: 0.8, output: 4 },
  };

  constructor(modelName = 'claude-3-5-haiku-20241022', apiKey?: string) {
    this.modelName = modelName;
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[Anthropic] API key not configured - adapter will return errors');
    }
  }

  async generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          system: request.systemPrompt,
          max_tokens: request.maxTokens || 1024,
          temperature: request.temperature ?? 0.7,
          stop_sequences: request.stopSequences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      return {
        content: data.content[0].text,
        finishReason: data.stop_reason === 'end_turn' ? 'stop' : 
                     data.stop_reason === 'max_tokens' ? 'length' : 'error',
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        modelUsed: this.modelName,
        latencyMs,
        metadata: {
          provider: 'anthropic',
          responseId: data.id,
        },
      };
    } catch (error) {
      throw new Error(`Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stream(request: LLMGenerationRequest): Promise<ReadableStream> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: 'user', content: request.prompt }],
        system: request.systemPrompt,
        max_tokens: request.maxTokens || 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic stream error: ${response.statusText}`);
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

    const startTime = Date.now();

    try {
      // Anthropic doesn't have a dedicated health endpoint, so we make a minimal request
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          provider: this.providerName,
          status: 'healthy',
          latencyMs,
          lastChecked: new Date(),
        };
      } else {
        return {
          provider: this.providerName,
          status: 'degraded',
          latencyMs,
          lastChecked: new Date(),
          errorMessage: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        provider: this.providerName,
        status: 'unavailable',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async estimateCost(request: LLMGenerationRequest): Promise<LLMCostEstimate> {
    const inputTokens = this.estimateTokenCount(
      `${request.systemPrompt || ''} ${request.prompt}`
    );
    const outputTokens = request.maxTokens || 1024;

    const pricingKey = Object.keys(this.pricing).find(k => this.modelName.includes(k)) || 'claude-3-5-haiku';
    const pricing = this.pricing[pricingKey];
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
      requestsPerMinute: 4000,
      tokensPerMinute: 400000,
      requestsRemaining: 3950,
      tokensRemaining: 395000,
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
