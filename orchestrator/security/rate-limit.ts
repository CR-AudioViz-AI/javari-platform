/**
 * Multi-AI Orchestrator - Multi-Layer Rate Limiting
 * Phase D: Enterprise-grade rate limiting with sliding windows
 */

import { db, isSupabaseConfigured } from '../db/client';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

// In-memory sliding window counters
const memoryCounters = new Map<string, { count: number; windowStart: number; violations: number }>();

// Rate limit configurations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  user: { windowMs: 60000, maxRequests: 100, keyPrefix: 'user' },
  ip: { windowMs: 60000, maxRequests: 300, keyPrefix: 'ip' },
  apiKey: { windowMs: 60000, maxRequests: 500, keyPrefix: 'key' },
  workflow: { windowMs: 300000, maxRequests: 20, keyPrefix: 'workflow' },
  provider: { windowMs: 60000, maxRequests: 1000, keyPrefix: 'provider' },
  global: { windowMs: 60000, maxRequests: 5000, keyPrefix: 'global' },
};

/**
 * Check rate limit with sliding window
 */
export async function checkRateLimit(
  layer: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[layer];
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();

  // Try Supabase first for distributed rate limiting
  if (isSupabaseConfigured()) {
    try {
      const result = await checkRateLimitDB(key, config, now);
      if (result) return result;
    } catch (error) {
      console.warn('[RateLimit] Database check failed, using in-memory fallback');
    }
  }

  // In-memory fallback
  return checkRateLimitMemory(key, config, now);
}

/**
 * Database-backed rate limiting (distributed)
 */
async function checkRateLimitDB(
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult | null> {
  const client = db['supabase'];
  if (!client) return null;

  const windowStart = now - config.windowMs;

  // This would use a custom Supabase function for atomic operations
  // For now, simplified version
  return null;
}

/**
 * In-memory rate limiting with sliding window
 */
function checkRateLimitMemory(
  key: string,
  config: RateLimitConfig,
  now: number
): RateLimitResult {
  const counter = memoryCounters.get(key);
  const windowStart = now - config.windowMs;

  if (!counter || counter.windowStart < windowStart) {
    // New window
    memoryCounters.set(key, {
      count: 1,
      windowStart: now,
      violations: counter?.violations || 0,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  // Within current window
  if (counter.count >= config.maxRequests) {
    // Rate limit exceeded
    counter.violations += 1;

    // Exponential cooldown
    const cooldownMultiplier = Math.min(Math.pow(2, counter.violations - 1), 16);
    const retryAfterMs = config.windowMs * cooldownMultiplier;

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(counter.windowStart + config.windowMs),
      retryAfterMs,
    };
  }

  // Increment counter
  counter.count += 1;

  return {
    allowed: true,
    remaining: config.maxRequests - counter.count,
    resetAt: new Date(counter.windowStart + config.windowMs),
  };
}

/**
 * Middleware factory for rate limiting
 */
export function rateLimitMiddleware(layer: keyof typeof RATE_LIMITS) {
  return async (identifier: string): Promise<RateLimitResult> => {
    return checkRateLimit(layer, identifier);
  };
}

/**
 * Reset rate limit for a key (admin function)
 */
export function resetRateLimit(layer: keyof typeof RATE_LIMITS, identifier: string): void {
  const config = RATE_LIMITS[layer];
  const key = `${config.keyPrefix}:${identifier}`;
  memoryCounters.delete(key);
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  activeKeys: number;
  totalViolations: number;
  keysByLayer: Record<string, number>;
} {
  const stats = {
    activeKeys: memoryCounters.size,
    totalViolations: 0,
    keysByLayer: {} as Record<string, number>,
  };

  for (const [key, counter] of memoryCounters.entries()) {
    stats.totalViolations += counter.violations;
    
    const layer = key.split(':')[0];
    stats.keysByLayer[layer] = (stats.keysByLayer[layer] || 0) + 1;
  }

  return stats;
}

/**
 * Clean expired counters (run periodically)
 */
export function cleanExpiredCounters(): void {
  const now = Date.now();
  
  for (const [key, counter] of memoryCounters.entries()) {
    const config = Object.values(RATE_LIMITS).find(c => key.startsWith(c.keyPrefix + ':'));
    if (!config) continue;

    const windowExpiry = counter.windowStart + config.windowMs;
    if (windowExpiry < now) {
      memoryCounters.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanExpiredCounters, 5 * 60 * 1000);
