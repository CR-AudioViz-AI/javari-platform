/**
 * GET /api/ai/analytics
 * Analytics and usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/orchestrator/audit/audit';
import { getCacheStats } from '@/orchestrator/cache/cache';
import { isSupabaseConfigured, db } from '@/orchestrator/db/client';

export async function GET(request: NextRequest) {
  try {
    // Get audit stats
    const auditStats = await auditLogger.getStats();

    // Get cache stats
    const cacheStats = getCacheStats();

    // Get provider analytics
    const providerAnalytics = Object.entries(auditStats.eventsByProvider).map(([provider, count]) => ({
      provider,
      requestCount: count,
      percentage: ((count / auditStats.totalEvents) * 100).toFixed(1),
    }));

    // Calculate event type distribution
    const eventTypeAnalytics = Object.entries(auditStats.eventsByType).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / auditStats.totalEvents) * 100).toFixed(1),
    }));

    return NextResponse.json({
      overview: {
        totalEvents: auditStats.totalEvents,
        totalCostUSD: auditStats.totalCost.toFixed(6),
        supabaseConfigured: isSupabaseConfigured(),
      },
      providers: providerAnalytics,
      eventTypes: eventTypeAnalytics,
      cache: {
        inMemorySize: cacheStats.inMemorySize,
        oldestEntry: cacheStats.oldestEntry,
        newestEntry: cacheStats.newestEntry,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
