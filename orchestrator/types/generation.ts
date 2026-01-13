/**
 * Generation Types
 * Core types for AI generation requests and responses
 */

export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
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
  model: string;
  provider: string;
  latencyMs: number;
  costUsd: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  metadata?: Record<string, any>;
}

export interface GenerationError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, any>;
}
