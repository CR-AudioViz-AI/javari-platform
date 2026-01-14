/**
 * Multi-AI Orchestrator - Health Check API Endpoint
 * Phase A: Foundation Layer
 * 
 * GET /api/ai/health
 * Returns health status of all registered LLM providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenAIAdapter } from '@/orchestrator/adapters/openai';
import { RouterEngine } from '@/orchestrator/router/router';

// Initialize router (singleton pattern)
let router: RouterEngine | null = null;

function getRouter(): RouterEngine {
  if (!router) {
    router = new RouterEngine({
      defaultProvider: 'openai',
      autoApproveThresholdUSD: 1.0,
      enableAudit: true,
    });

    // Register OpenAI adapter
    const openaiAdapter = new OpenAIAdapter('gpt-4');
    router.registerAdapter('openai', openaiAdapter);
  }
  return router;
}

export async function GET(request: NextRequest) {
  try {
    const router = getRouter();
    const healthResults = await router.checkHealth();

    // Convert Map to object for JSON serialization
    const healthStatus: Record<string, any> = {};
    for (const [provider, health] of healthResults.entries()) {
      healthStatus[provider] = health;
    }

    // Determine overall status
    const statuses = Array.from(healthResults.values()).map(h => h.status);
    let overall: 'healthy' | 'degraded' | 'unavailable' = 'healthy';
    
    if (statuses.includes('unavailable')) {
      overall = 'unavailable';
    } else if (statuses.includes('degraded')) {
      overall = 'degraded';
    }

    return NextResponse.json({
      overall,
      providers: healthStatus,
      timestamp: new Date().toISOString(),
      phaseA: true, // Indicator that this is Phase A implementation
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

// OPTIONS for CORS
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
