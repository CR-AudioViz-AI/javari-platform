/**
 * AI Health Check API Endpoint
 * GET /api/ai/health
 */

import { NextResponse } from 'next/server';
import { openaiAdapter } from '@/orchestrator/adapters/openai';

export async function GET() {
  try {
    // Check OpenAI adapter health
    const openaiHealth = await openaiAdapter.healthCheck();
    const rateLimits = await openaiAdapter.getRateLimits();

    // Overall system health
    const systemStatus = openaiHealth.status === 'healthy' ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: systemStatus,
      timestamp: new Date().toISOString(),
      adapters: {
        openai: openaiHealth,
      },
      rateLimits: {
        openai: rateLimits,
      },
      phase: 'A',
      features: {
        openaiAdapter: true,
        anthropicAdapter: false,
        approvalGates: true,
        auditLogging: true,
        persistentStorage: false,
      },
    });
  } catch (error) {
    console.error('Health Check Error:', error);

    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
