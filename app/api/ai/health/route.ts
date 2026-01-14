/**
 * Multi-AI Orchestrator - Health Check API Endpoint
 * Phase B: Enhanced to show all provider statuses
 * 
 * GET /api/ai/health
 * Returns health status of all configured LLM providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { RouterEngine } from '@/orchestrator/router/router';

// Initialize router (singleton pattern)
let router: RouterEngine | null = null;

function getRouter(): RouterEngine {
  if (!router) {
    router = new RouterEngine({
      routingStrategy: 'cheapest',
      enableAudit: true,
    });
  }
  return router;
}

export async function GET(request: NextRequest) {
  try {
    const router = getRouter();
    const healthResults = await router.checkHealth();
    const routingSummary = router.getRoutingSummary();

    // Convert Map to object for JSON serialization
    const healthStatus: Record<string, any> = {};
    for (const [provider, health] of healthResults.entries()) {
      healthStatus[provider] = health;
    }

    // Determine overall status
    const statuses = Array.from(healthResults.values()).map(h => h.status);
    let overall: 'healthy' | 'degraded' | 'unavailable' = 'healthy';
    
    if (statuses.length === 0) {
      overall = 'unavailable';
    } else if (statuses.includes('unavailable')) {
      overall = 'degraded';
    } else if (statuses.includes('degraded')) {
      overall = 'degraded';
    }

    return NextResponse.json({
      overall,
      providers: healthStatus,
      routing: routingSummary,
      timestamp: new Date().toISOString(),
      phaseB: true,
    });

  } catch (error) {
    console.error('Error in /api/ai/health:', error);
    return NextResponse.json(
      {
        overall: 'unavailable',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
