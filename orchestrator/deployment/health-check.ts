/**
 * Multi-AI Orchestrator - Health Check
 * Phase D: Comprehensive system health validation
 */

import { validateDeploymentEnvironment } from './env-validate';
import { isSupabaseConfigured } from '../db/client';
import { getActiveProviders } from '../providers';
import { globalCircuitBreaker } from '../providers/circuit-breaker';
import { getRateLimitStats } from '../security/rate-limit';
import { metricsCollector } from '../telemetry/metrics';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  components: {
    environment: { status: string; details: any };
    database: { status: string; details: any };
    providers: { status: string; details: any };
    circuitBreakers: { status: string; details: any };
    rateLimiting: { status: string; details: any };
    router: { status: string };
  };
}

const startTime = Date.now();

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const components: any = {};

  // Environment validation
  const envValidation = validateDeploymentEnvironment();
  components.environment = {
    status: envValidation.valid ? 'healthy' : envValidation.errors.length > 0 ? 'unhealthy' : 'degraded',
    details: {
      valid: envValidation.valid,
      errors: envValidation.errors,
      warnings: envValidation.warnings,
      info: envValidation.info,
    },
  };

  // Database
  components.database = {
    status: isSupabaseConfigured() ? 'healthy' : 'degraded',
    details: {
      configured: isSupabaseConfigured(),
      fallback: !isSupabaseConfigured() ? 'in-memory' : null,
    },
  };

  // Providers
  const activeProviders = getActiveProviders();
  const breakerStats = globalCircuitBreaker.getStats();
  const openBreakers = Object.entries(breakerStats).filter(([_, s]) => s.state === 'open');

  components.providers = {
    status: activeProviders.length === 0 ? 'unhealthy' : 
            openBreakers.length === activeProviders.length ? 'unhealthy' : 
            openBreakers.length > 0 ? 'degraded' : 'healthy',
    details: {
      total: activeProviders.length,
      active: activeProviders.filter(p => {
        const stats = breakerStats[p.name];
        return !stats || stats.state !== 'open';
      }).length,
      circuitBreakersOpen: openBreakers.length,
    },
  };

  // Circuit breakers
  components.circuitBreakers = {
    status: openBreakers.length > 0 ? 'degraded' : 'healthy',
    details: breakerStats,
  };

  // Rate limiting
  const rateLimitStats = getRateLimitStats();
  components.rateLimiting = {
    status: 'healthy',
    details: rateLimitStats,
  };

  // Router
  components.router = {
    status: 'healthy',
  };

  // Overall status
  const statuses = Object.values(components).map((c: any) => c.status);
  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 
    statuses.includes('unhealthy') ? 'unhealthy' :
    statuses.includes('degraded') ? 'degraded' : 'healthy';

  return {
    status: overallStatus,
    timestamp: new Date(),
    uptime: Date.now() - startTime,
    components,
  };
}
