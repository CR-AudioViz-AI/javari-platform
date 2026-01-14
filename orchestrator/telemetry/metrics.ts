/**
 * Multi-AI Orchestrator - Telemetry & Metrics Engine
 * Phase D: Comprehensive observability
 */

interface MetricPoint {
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
}

interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
}

class MetricsCollector {
  private latencies = new Map<string, number[]>();
  private errorCounts = new Map<string, number>();
  private successCounts = new Map<string, number>();
  private costs = new Map<string, number[]>();
  private fallbackCounts = new Map<string, number>();
  private routingDistribution = new Map<string, number>();

  /**
   * Record latency metric
   */
  recordLatency(provider: string, latencyMs: number): void {
    if (!this.latencies.has(provider)) {
      this.latencies.set(provider, []);
    }
    
    const latencies = this.latencies.get(provider)!;
    latencies.push(latencyMs);
    
    // Keep last 1000 samples per provider
    if (latencies.length > 1000) {
      latencies.shift();
    }
  }

  /**
   * Record error
   */
  recordError(provider: string): void {
    this.errorCounts.set(provider, (this.errorCounts.get(provider) || 0) + 1);
  }

  /**
   * Record success
   */
  recordSuccess(provider: string): void {
    this.successCounts.set(provider, (this.successCounts.get(provider) || 0) + 1);
  }

  /**
   * Record cost
   */
  recordCost(provider: string, costUSD: number): void {
    if (!this.costs.has(provider)) {
      this.costs.set(provider, []);
    }
    this.costs.get(provider)!.push(costUSD);
  }

  /**
   * Record fallback usage
   */
  recordFallback(fromProvider: string, toProvider: string): void {
    const key = `${fromProvider}→${toProvider}`;
    this.fallbackCounts.set(key, (this.fallbackCounts.get(key) || 0) + 1);
  }

  /**
   * Record routing decision
   */
  recordRouting(provider: string): void {
    this.routingDistribution.set(provider, (this.routingDistribution.get(provider) || 0) + 1);
  }

  /**
   * Calculate latency percentiles
   */
  getLatencyMetrics(provider: string): LatencyMetrics | null {
    const latencies = this.latencies.get(provider);
    if (!latencies || latencies.length === 0) return null;

    const sorted = [...latencies].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
      mean: sorted.reduce((sum, val) => sum + val, 0) / len,
      min: sorted[0],
      max: sorted[len - 1],
    };
  }

  /**
   * Get error rate for provider
   */
  getErrorRate(provider: string): number {
    const errors = this.errorCounts.get(provider) || 0;
    const successes = this.successCounts.get(provider) || 0;
    const total = errors + successes;
    
    return total > 0 ? (errors / total) * 100 : 0;
  }

  /**
   * Get cost per 1M tokens (rolling average)
   */
  getCostPerMillion(provider: string): number | null {
    const costs = this.costs.get(provider);
    if (!costs || costs.length === 0) return null;

    const avgCost = costs.reduce((sum, val) => sum + val, 0) / costs.length;
    return avgCost * 1_000_000; // Convert to per 1M
  }

  /**
   * Get complete metrics snapshot
   */
  getMetricsSnapshot(): {
    providers: Record<string, {
      latency: LatencyMetrics | null;
      errorRate: number;
      successCount: number;
      errorCount: number;
      costPerMToken: number | null;
    }>;
    fallbacks: Record<string, number>;
    routing: Record<string, number>;
    timestamp: Date;
  } {
    const providers: any = {};
    const allProviders = new Set([
      ...this.latencies.keys(),
      ...this.errorCounts.keys(),
      ...this.successCounts.keys(),
    ]);

    for (const provider of allProviders) {
      providers[provider] = {
        latency: this.getLatencyMetrics(provider),
        errorRate: this.getErrorRate(provider),
        successCount: this.successCounts.get(provider) || 0,
        errorCount: this.errorCounts.get(provider) || 0,
        costPerMToken: this.getCostPerMillion(provider),
      };
    }

    return {
      providers,
      fallbacks: Object.fromEntries(this.fallbackCounts),
      routing: Object.fromEntries(this.routingDistribution),
      timestamp: new Date(),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.latencies.clear();
    this.errorCounts.clear();
    this.successCounts.clear();
    this.costs.clear();
    this.fallbackCounts.clear();
    this.routingDistribution.clear();
  }
}

// Global metrics collector
export const metricsCollector = new MetricsCollector();
