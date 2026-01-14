/**
 * Multi-AI Orchestrator - Provider Circuit Breakers
 * Phase D: Automatic provider failure detection and recovery
 */

interface CircuitBreakerConfig {
  failureThreshold: number; // Percentage (e.g., 50 = 50%)
  slowCallThreshold: number; // Milliseconds
  windowSize: number; // Number of recent calls to track
  cooldownMs: number; // Time before attempting recovery
  halfOpenMaxAttempts: number; // Attempts in half-open state
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  slowCalls: number;
  totalCalls: number;
  lastFailureAt?: Date;
  openedAt?: Date;
  halfOpenAttempts: number;
  recentCalls: { success: boolean; latencyMs: number; timestamp: Date }[];
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 50, // 50% error rate triggers open
  slowCallThreshold: 5000, // 5 seconds
  windowSize: 100, // Track last 100 calls
  cooldownMs: 60000, // 1 minute cooldown
  halfOpenMaxAttempts: 3, // 3 test attempts in half-open
};

export class CircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if provider is available
   */
  isAvailable(provider: string): boolean {
    const state = this.getState(provider);
    
    if (state.state === 'closed') return true;
    if (state.state === 'open') {
      // Check if cooldown period has elapsed
      if (state.openedAt) {
        const elapsed = Date.now() - state.openedAt.getTime();
        if (elapsed >= this.config.cooldownMs) {
          // Transition to half-open
          state.state = 'half-open';
          state.halfOpenAttempts = 0;
          console.log(`[CircuitBreaker] ${provider} → half-open (cooldown elapsed)`);
          return true;
        }
      }
      return false;
    }
    
    // half-open state
    return state.halfOpenAttempts < this.config.halfOpenMaxAttempts;
  }

  /**
   * Record successful call
   */
  recordSuccess(provider: string, latencyMs: number): void {
    const state = this.getState(provider);
    
    state.successes += 1;
    state.totalCalls += 1;
    
    const call = { success: true, latencyMs, timestamp: new Date() };
    this.addCall(state, call);

    if (latencyMs > this.config.slowCallThreshold) {
      state.slowCalls += 1;
    }

    // Handle state transitions
    if (state.state === 'half-open') {
      state.halfOpenAttempts += 1;
      
      if (state.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        // All test calls succeeded, close the circuit
        state.state = 'closed';
        state.failures = 0;
        state.slowCalls = 0;
        state.halfOpenAttempts = 0;
        console.log(`[CircuitBreaker] ${provider} → closed (recovery successful)`);
      }
    }

    this.checkThresholds(provider, state);
  }

  /**
   * Record failed call
   */
  recordFailure(provider: string, latencyMs: number = 0): void {
    const state = this.getState(provider);
    
    state.failures += 1;
    state.totalCalls += 1;
    state.lastFailureAt = new Date();
    
    const call = { success: false, latencyMs, timestamp: new Date() };
    this.addCall(state, call);

    // Handle state transitions
    if (state.state === 'half-open') {
      // Failure in half-open → immediately reopen
      state.state = 'open';
      state.openedAt = new Date();
      state.halfOpenAttempts = 0;
      console.log(`[CircuitBreaker] ${provider} → open (half-open test failed)`);
      return;
    }

    this.checkThresholds(provider, state);
  }

  /**
   * Check if thresholds are exceeded
   */
  private checkThresholds(provider: string, state: CircuitBreakerState): void {
    if (state.state === 'open') return;

    const recentCalls = state.recentCalls.slice(-this.config.windowSize);
    if (recentCalls.length < 10) return; // Need minimum sample size

    const failureRate = (state.failures / state.totalCalls) * 100;

    if (failureRate >= this.config.failureThreshold) {
      state.state = 'open';
      state.openedAt = new Date();
      console.log(`[CircuitBreaker] ${provider} → open (failure rate: ${failureRate.toFixed(1)}%)`);
      
      // Log to audit
      this.logBreakerEvent(provider, 'opened', { failureRate });
    }
  }

  /**
   * Get current state for provider
   */
  getState(provider: string): CircuitBreakerState {
    if (!this.states.has(provider)) {
      this.states.set(provider, {
        state: 'closed',
        failures: 0,
        successes: 0,
        slowCalls: 0,
        totalCalls: 0,
        halfOpenAttempts: 0,
        recentCalls: [],
      });
    }
    return this.states.get(provider)!;
  }

  /**
   * Add call to recent calls window
   */
  private addCall(state: CircuitBreakerState, call: { success: boolean; latencyMs: number; timestamp: Date }): void {
    state.recentCalls.push(call);
    
    // Maintain sliding window
    if (state.recentCalls.length > this.config.windowSize) {
      const removed = state.recentCalls.shift()!;
      
      // Adjust counters
      if (removed.success) {
        state.successes = Math.max(0, state.successes - 1);
      } else {
        state.failures = Math.max(0, state.failures - 1);
      }
      state.totalCalls = Math.max(0, state.totalCalls - 1);
    }
  }

  /**
   * Get statistics for all providers
   */
  getStats(): Record<string, {
    state: string;
    failureRate: number;
    avgLatency: number;
    totalCalls: number;
    openedAt?: Date;
  }> {
    const stats: any = {};

    for (const [provider, state] of this.states.entries()) {
      const avgLatency = state.recentCalls.length > 0
        ? state.recentCalls.reduce((sum, c) => sum + c.latencyMs, 0) / state.recentCalls.length
        : 0;

      stats[provider] = {
        state: state.state,
        failureRate: state.totalCalls > 0 ? (state.failures / state.totalCalls) * 100 : 0,
        avgLatency: Math.round(avgLatency),
        totalCalls: state.totalCalls,
        openedAt: state.openedAt,
      };
    }

    return stats;
  }

  /**
   * Manually reset a circuit breaker
   */
  reset(provider: string): void {
    this.states.delete(provider);
    console.log(`[CircuitBreaker] ${provider} manually reset`);
  }

  /**
   * Log breaker event to audit
   */
  private async logBreakerEvent(provider: string, event: string, metadata: any): Promise<void> {
    try {
      const { auditLogger } = await import('../audit/audit');
      await auditLogger.logEvent({
        eventId: `breaker-${provider}-${Date.now()}`,
        eventType: 'circuit_breaker',
        timestamp: new Date(),
        userId: 'system',
        provider,
        metadata: { event, ...metadata },
      });
    } catch (error) {
      console.warn('[CircuitBreaker] Failed to log event:', error);
    }
  }
}

// Global circuit breaker instance
export const globalCircuitBreaker = new CircuitBreaker();
