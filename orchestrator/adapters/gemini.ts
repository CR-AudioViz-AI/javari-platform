/**
 * Multi-AI Orchestrator - Google Gemini Adapter
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

export class GeminiAdapter implements LLMAdapter {
  readonly providerName = 'gemini';
  readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  private readonly supportedCapabilities = new Set([
    'text-generation',
    'streaming',
    'vision',
    'long-context',
  ]);

  // Pricing per 1M tokens (USD)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'gemini-pro': { input: 0.5, output: 1.5 },
    'gemini-pro-vision': { input: 0.5, output: 1.5 },
    'gemini-1.5-pro': { input: 1.25, output: 5 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  };

  constructor(modelName = 'gemini-1.5-flash', apiKey?: string) {
    this.modelName = modelName;
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[Gemini] API key not configured - adapter will return errors');
    }
  }

  async generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const startTime = Date.now();

    try {
      const prompt = request.systemPrompt 
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt;

      const response = await fetch(
        `${this.baseURL}/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens || 2048,
              stopSequences: request.stopSequences,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const content = data.candidates[0].content.parts[0].text;
      const inputTokens = data.usageMetadata?.promptTokenCount || this.estimateTokenCount(prompt);
      const outputTokens = data.usageMetadata?.candidatesTokenCount || this.estimateTokenCount(content);

      return {
        content,
        finishReason: data.candidates[0].finishReason === 'STOP' ? 'stop' : 
                     data.candidates[0].finishReason === 'MAX_TOKENS' ? 'length' : 'error',
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        modelUsed: this.modelName,
        latencyMs,
        metadata: {
          provider: 'gemini',
        },
      };
    } catch (error) {
      throw new Error(`Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stream(request: LLMGenerationRequest): Promise<ReadableStream> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = request.systemPrompt 
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    const response = await fetch(
      `${this.baseURL}/models/${this.modelName}:streamGenerateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini stream error: ${response.statusText}`);
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
      const response = await fetch(
        `${this.baseURL}/models?key=${this.apiKey}`
      );

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
    const outputTokens = request.maxTokens || 2048;

    const pricingKey = Object.keys(this.pricing).find(k => this.modelName.includes(k)) || 'gemini-1.5-flash';
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
      requestsPerMinute: 1500,
      tokensPerMinute: 1000000,
      requestsRemaining: 1450,
      tokensRemaining: 950000,
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
