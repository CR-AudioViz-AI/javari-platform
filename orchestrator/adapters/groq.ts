/**
 * Multi-AI Orchestrator - Groq Adapter
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

export class GroqAdapter implements LLMAdapter {
  readonly providerName = 'groq';
  readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.groq.com/openai/v1';

  private readonly supportedCapabilities = new Set(['text-generation', 'streaming', 'fast-inference']);

  // Pricing per 1M tokens (USD)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
    'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
    'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  };

  constructor(modelName = 'llama-3.3-70b-versatile', apiKey?: string) {
    this.modelName = modelName;
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[Groq] API key not configured - adapter will return errors');
    }
  }

  async generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
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
          stop: request.stopSequences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        finishReason: data.choices[0].finish_reason === 'stop' ? 'stop' : 
                     data.choices[0].finish_reason === 'length' ? 'length' : 'error',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        modelUsed: this.modelName,
        latencyMs,
        metadata: { provider: 'groq', responseId: data.id },
      };
    } catch (error) {
      throw new Error(`Groq generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stream(request: LLMGenerationRequest): Promise<ReadableStream> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
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
      throw new Error(`Groq stream error: ${response.statusText}`);
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
      const response = await fetch(`${this.baseURL}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return { provider: this.providerName, status: 'healthy', latencyMs, lastChecked: new Date() };
      } else {
        return { provider: this.providerName, status: 'degraded', latencyMs, lastChecked: new Date(), errorMessage: `HTTP ${response.status}` };
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
    const inputTokens = this.estimateTokenCount(`${request.systemPrompt || ''} ${request.prompt}`);
    const outputTokens = request.maxTokens || 1024;

    const pricingKey = Object.keys(this.pricing).find(k => this.modelName.includes(k)) || 'mixtral-8x7b-32768';
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
      requestsPerMinute: 30,
      tokensPerMinute: 14400,
      requestsRemaining: 28,
      tokensRemaining: 14000,
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
