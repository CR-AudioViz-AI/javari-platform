/**
 * Multi-AI Orchestrator - Caching Layer
 * Phase C: Response caching with Supabase persistence
 */

import crypto from 'crypto';
import { db, isSupabaseConfigured } from '../db/client';
import type { LLMGenerationRequest } from '../types/llm-adapter';
import type { GenerationResult } from '../types/generation';

interface CachedResponse {
  provider: string;
  model: string;
  response: string;
  tokens: { input: number; output: number; total: number };
  cost: number;
  timestamp: Date;
}

const inMemoryCache = new Map<string, CachedResponse>();
const DEFAULT_TTL_HOURS = 24;

/**
 * Generate stable hash for request
 */
export function generateRequestHash(
  request: LLMGenerationRequest,
  provider?: string
): string {
  const hashInput = JSON.stringify({
    prompt: request.prompt,
    systemPrompt: request.systemPrompt,
    temperature: request.temperature,
    maxTokens: request.maxTokens,
    provider: provider || 'auto',
  });

  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Get cached response
 */
export async function getCachedResponse(
  request: LLMGenerationRequest,
  provider?: string
): Promise<CachedResponse | null> {
  const hash = generateRequestHash(request, provider);

  // Check in-memory cache first
  const memCached = inMemoryCache.get(hash);
  if (memCached) {
    console.log(`[Cache] HIT (memory): ${hash.substring(0, 12)}`);
    return memCached;
  }

  // Check Supabase cache
  if (isSupabaseConfigured()) {
    try {
      const cached = await db.cache.get(hash);
      if (cached) {
        const response: CachedResponse = {
          provider: cached.provider,
          model: cached.model,
          response: cached.response_body.content,
          tokens: {
            input: cached.tokens_in || 0,
            output: cached.tokens_out || 0,
            total: (cached.tokens_in || 0) + (cached.tokens_out || 0),
          },
          cost: cached.cost_usd ? parseFloat(cached.cost_usd.toString()) : 0,
          timestamp: new Date(cached.created_at!),
        };

        // Store in memory for faster subsequent access
        inMemoryCache.set(hash, response);

        // Increment hit count
        await db.cache.incrementHit(hash);

        console.log(`[Cache] HIT (db): ${hash.substring(0, 12)}`);
        return response;
      }
    } catch (error) {
      console.warn('[Cache] Database lookup failed:', error);
    }
  }

  console.log(`[Cache] MISS: ${hash.substring(0, 12)}`);
  return null;
}

/**
 * Set cached response
 */
export async function setCachedResponse(
  request: LLMGenerationRequest,
  result: GenerationResult,
  provider?: string,
  ttlHours: number = DEFAULT_TTL_HOURS
): Promise<void> {
  const hash = generateRequestHash(request, provider);

  const cached: CachedResponse = {
    provider: result.provider,
    model: result.model,
    response: result.content || '',
    tokens: result.usage || { input: 0, output: 0, total: 0 },
    cost: result.costUSD || 0,
    timestamp: new Date(),
  };

  // Store in memory
  inMemoryCache.set(hash, cached);

  // Store in Supabase
  if (isSupabaseConfigured()) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      await db.cache.set({
        request_hash: hash,
        provider: result.provider,
        model: result.model,
        request_body: {
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        },
        response_body: {
          content: result.content,
          usage: result.usage,
        },
        tokens_in: result.usage?.promptTokens,
        tokens_out: result.usage?.completionTokens,
        cost_usd: result.costUSD,
        expires_at: expiresAt,
      });

      console.log(`[Cache] SET: ${hash.substring(0, 12)}`);
    } catch (error) {
      console.warn('[Cache] Failed to persist to database:', error);
    }
  }
}

/**
 * Clear expired cache entries (in-memory only, DB has auto-cleanup)
 */
export function clearExpiredCache(): void {
  const now = new Date();
  for (const [hash, cached] of inMemoryCache.entries()) {
    const age = now.getTime() - cached.timestamp.getTime();
    if (age > DEFAULT_TTL_HOURS * 60 * 60 * 1000) {
      inMemoryCache.delete(hash);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  inMemorySize: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  let oldest: Date | null = null;
  let newest: Date | null = null;

  for (const cached of inMemoryCache.values()) {
    if (!oldest || cached.timestamp < oldest) oldest = cached.timestamp;
    if (!newest || cached.timestamp > newest) newest = cached.timestamp;
  }

  return {
    inMemorySize: inMemoryCache.size,
    oldestEntry: oldest,
    newestEntry: newest,
  };
}
