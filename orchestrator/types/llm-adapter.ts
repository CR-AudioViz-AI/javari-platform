/**
 * LLM Adapter Interface
 * All AI provider adapters must implement this interface
 */

export type AICapability = 
  | 'text-generation'
  | 'code-generation'
  | 'function-calling'
  | 'json-mode'
  | 'streaming'
  | 'vision'
  | 'embeddings';

export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;                  // 0.0 - 2.0
  maxTokens?: number;
  model?: string;                        // Provider-specific model name
  stopSequences?: string[];
  metadata?: Record<string, any>;
}

export interface GenerationResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;                         // Actual model used
  provider: string;                      // Provider name
  latencyMs: number;
  costUsd: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  metadata?: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  responseTimeMs: number;
  lastChecked: string;
  message?: string;
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  tokensPerMinute: number;
  remaining: number;
  resetAt: string;
}

export interface CostEstimate {
  estimatedCostUsd: number;
  basedOn: 'prompt_tokens' | 'model_default' | 'historical_average';
  confidence: number;                    // 0.0 - 1.0
}

export interface LLMAdapter {
  // Metadata
  name: string;                          // 'openai' | 'anthropic' | 'google' | etc.
  version: string;                       // Adapter version
  
  // Capabilities
  supports(capability: AICapability): boolean;
  
  // Generation
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  
  // Streaming (Phase B)
  generateStream?(request: GenerationRequest): AsyncIterator<any>;
  
  // Health & Limits
  healthCheck(): Promise<HealthStatus>;
  getRateLimits(): Promise<RateLimitInfo>;
  
  // Cost Estimation
  estimateCost(request: GenerationRequest): Promise<CostEstimate>;
}
