/**
 * GET /api/ai/telemetry
 * Real-time metrics and observability data
 */

import { NextRequest, NextResponse } from 'next/server';
import { metricsCollector } from '@/orchestrator/telemetry/metrics';
import { globalCircuitBreaker } from '@/orchestrator/providers/circuit-breaker';
import { getRateLimitStats } from '@/orchestrator/security/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const metrics = metricsCollector.getMetricsSnapshot();
    const circuitBreakers = globalCircuitBreaker.getStats();
    const rateLimits = getRateLimitStats();

    return NextResponse.json({
      metrics: {
        providers: metrics.providers,
        fallbacks: metrics.fallbacks,
        routing: metrics.routing,
      },
      circuitBreakers,
      rateLimits,
      timestamp: metrics.timestamp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
