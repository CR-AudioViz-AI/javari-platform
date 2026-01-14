/**
 * POST /api/workflows/create
 * Save a workflow definition
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';
import { validateWorkflow } from '@/orchestrator/workflows/schema';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, description, version, definition, createdBy } = body;

    if (!name || !version || !definition) {
      return NextResponse.json(
        { error: 'name, version, and definition are required' },
        { status: 400 }
      );
    }

    // Validate workflow definition
    const validation = validateWorkflow(definition);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid workflow definition', details: validation.errors },
        { status: 400 }
      );
    }

    // Save to database
    const workflow = await db.workflows.create({
      name,
      description,
      version,
      definition,
      status: 'active',
      created_by: createdBy,
    });

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      name: workflow.name,
      version: workflow.version,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
