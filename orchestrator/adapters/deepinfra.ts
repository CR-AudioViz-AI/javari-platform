/** DeepInfra Adapter - Phase B */
import type { LLMAdapter, LLMGenerationRequest, LLMGenerationResponse, LLMHealthStatus, LLMCostEstimate, LLMRateLimits } from '../types/llm-adapter';

export class DeepInfraAdapter implements LLMAdapter {
  readonly providerName = 'deepinfra';
  readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.deepinfra.com/v1/openai';
  private readonly supportedCapabilities = new Set(['text-generation', 'streaming']);
  private readonly pricing = { 'meta-llama/Meta-Llama-3.1-70B-Instruct': { input: 0.35, output: 0.4 } };

  constructor(modelName = 'meta-llama/Meta-Llama-3.1-70B-Instruct', apiKey?: string) {
    this.modelName = modelName;
    this.apiKey = apiKey || process.env.DEEPINFRA_API_KEY || '';
    if (!this.apiKey) console.warn('[DeepInfra] API key not configured');
  }

  async generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    if (!this.apiKey) throw new Error('DeepInfra API key not configured');
    const startTime = Date.now();
    const messages = [];
    if (request.systemPrompt) messages.push({ role: 'system', content: request.systemPrompt });
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.modelName, messages, temperature: request.temperature ?? 0.7, max_tokens: request.maxTokens || 1024 }),
    });

    if (!response.ok) throw new Error(`DeepInfra API error: ${response.statusText}`);
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      finishReason: 'stop',
      usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
      modelUsed: this.modelName,
      latencyMs: Date.now() - startTime,
      metadata: { provider: 'deepinfra' },
    };
  }

  async stream(request: LLMGenerationRequest): Promise<ReadableStream> {
    if (!this.apiKey) throw new Error('DeepInfra API key not configured');
    const messages = [];
    if (request.systemPrompt) messages.push({ role: 'system', content: request.systemPrompt });
    messages.push({ role: 'user', content: request.prompt });
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.modelName, messages, stream: true }),
    });
    if (!response.ok) throw new Error(`DeepInfra stream error: ${response.statusText}`);
    return response.body!;
  }

  async healthCheck(): Promise<LLMHealthStatus> {
    if (!this.apiKey) return { provider: this.providerName, status: 'unavailable', latencyMs: 0, lastChecked: new Date(), errorMessage: 'API key not configured' };
    return { provider: this.providerName, status: 'healthy', latencyMs: 0, lastChecked: new Date() };
  }

  async estimateCost(request: LLMGenerationRequest): Promise<LLMCostEstimate> {
    const inputTokens = Math.ceil((`${request.systemPrompt || ''} ${request.prompt}`).length / 4);
    const outputTokens = request.maxTokens || 1024;
    const pricing = this.pricing['meta-llama/Meta-Llama-3.1-70B-Instruct'];
    return {
      estimatedCostUSD: (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output,
      inputTokenCost: (inputTokens / 1_000_000) * pricing.input,
      outputTokenCost: (outputTokens / 1_000_000) * pricing.output,
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
    };
  }

  async getRateLimits(): Promise<LLMRateLimits> {
    const now = Date.now();
    return { requestsPerMinute: 100, tokensPerMinute: 200000, requestsRemaining: 98, tokensRemaining: 198000, resetAtMs: now + 60000 };
  }

  supports(capability: string): boolean {
    return this.supportedCapabilities.has(capability);
  }
}
