/**
 * GET /api/workflows/list
 * List all workflows
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
    const status = searchParams.get('status') || undefined;

    const workflows = await db.workflows.list(status);

    return NextResponse.json({
      total: workflows.length,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        version: w.version,
        status: w.status,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
