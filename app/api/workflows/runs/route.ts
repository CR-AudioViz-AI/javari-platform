/**
 * GET /api/workflows/runs
 * Get workflow run history
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const runs = await db.workflowRuns.list({ workflowId, userId, limit });

    return NextResponse.json({
      total: runs.length,
      runs: runs.map(r => ({
        id: r.id,
        workflowId: r.workflow_id,
        workflowName: r.workflow_name,
        workflowVersion: r.workflow_version,
        status: r.status,
        totalCostUSD: r.total_cost_usd,
        totalLatencyMs: r.total_latency_ms,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        error: r.error,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
