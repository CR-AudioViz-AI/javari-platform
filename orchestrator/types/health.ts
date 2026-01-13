/**
 * Health Status Types
 * Health check and monitoring types
 */

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
  confidence: number;
}
