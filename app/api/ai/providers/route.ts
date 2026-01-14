/**
 * Multi-AI Orchestrator - Providers API Endpoint
 * Phase B: GET /api/ai/providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, getActiveProviders } from '@/orchestrator/providers';

export async function GET(request: NextRequest) {
  try {
    const allProviders = getAllProviders();
    const activeProviders = getActiveProviders();

    return NextResponse.json({
      total: allProviders.length,
      active: activeProviders.length,
      providers: allProviders.map(p => ({
        name: p.name,
        displayName: p.displayName,
        isConfigured: p.isConfigured,
        defaultModel: p.defaultModel,
        capabilities: p.capabilities,
        estimatedCost: {
          inputPerMToken: p.estimatedCostPerMToken.input,
          outputPerMToken: p.estimatedCostPerMToken.output,
        },
        typicalLatencyMs: p.typicalLatencyMs,
        maxContextLength: p.maxContextLength,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}
