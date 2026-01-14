/**
 * POST /api/workflows/run
 * Execute a workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorkflowEngine } from '@/orchestrator/workflows/engine';
import type { WorkflowDefinition } from '@/orchestrator/workflows/schema';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'default-user';

    let workflow: WorkflowDefinition;
    let workflowId: string | undefined;

    // Load workflow from ID or use provided definition
    if (body.workflowId) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: 'Supabase not configured - cannot load workflow by ID' },
          { status: 503 }
        );
      }

      const stored = await db.workflows.get(body.workflowId);
      workflow = stored.definition;
      workflowId = stored.id;
    } else if (body.workflow) {
      workflow = body.workflow;
    } else {
      return NextResponse.json(
        { error: 'Either workflowId or workflow definition required' },
        { status: 400 }
      );
    }

    // Execute workflow
    const engine = new WorkflowEngine();
    const result = await engine.execute(workflow, userId, workflowId);

    return NextResponse.json({
      success: result.status === 'completed',
      runId: result.runId,
      workflowId: result.workflowId,
      status: result.status,
      steps: result.steps,
      totalCostUSD: result.totalCostUSD,
      totalLatencyMs: result.totalLatencyMs,
      error: result.error,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
