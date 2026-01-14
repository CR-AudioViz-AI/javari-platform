/**
 * Multi-AI Orchestrator - Health Check Types
 * Phase A: Foundation Layer
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable';

export interface ProviderHealth {
  provider: string;
  model: string;
  status: HealthStatus;
  latencyMs: number;
  lastChecked: Date;
  errorMessage?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  overall: HealthStatus;
  providers: ProviderHealth[];
  checkedAt: Date;
}
