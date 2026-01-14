/**
 * Multi-AI Orchestrator - LLM Adapter Interface
 * Phase A: Foundation Layer
 * 
 * Defines the contract that all LLM provider adapters must implement.
 */

export interface LLMGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

export interface LLMGenerationResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelUsed: string;
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export interface LLMHealthStatus {
  provider: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  latencyMs: number;
  lastChecked: Date;
  errorMessage?: string;
}

export interface LLMCostEstimate {
  estimatedCostUSD: number;
  inputTokenCost: number;
  outputTokenCost: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
}

export interface LLMRateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsRemaining: number;
  tokensRemaining: number;
  resetAtMs: number;
}

export interface LLMCapability {
  name: string;
  supported: boolean;
  details?: Record<string, unknown>;
}

/**
 * Base interface that all LLM adapters must implement
 */
export interface LLMAdapter {
  readonly providerName: string;
  readonly modelName: string;
  
  /**
   * Generate completion from the LLM
   */
  generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse>;
  
  /**
   * Stream completion from the LLM (Phase B)
   */
  stream(request: LLMGenerationRequest): Promise<ReadableStream>;
  
  /**
   * Check provider health and availability
   */
  healthCheck(): Promise<LLMHealthStatus>;
  
  /**
   * Estimate cost for a generation request
   */
  estimateCost(request: LLMGenerationRequest): Promise<LLMCostEstimate>;
  
  /**
   * Get current rate limit status
   */
  getRateLimits(): Promise<LLMRateLimits>;
  
  /**
   * Check if provider supports a specific capability
   */
  supports(capability: string): boolean;
}
