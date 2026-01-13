/**
 * AI Generation API Endpoint
 * POST /api/ai/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeRequest } from '@/orchestrator/router/router';
import type { GenerationRequest } from '@/orchestrator/types/generation';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Extract user ID (in production, get from auth session)
    const userId = body.userId || 'anonymous';

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build generation request
    const generationRequest: GenerationRequest = {
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      model: body.model,
      stopSequences: body.stopSequences,
      metadata: body.metadata,
    };

    // Route through orchestrator
    const result = await routeRequest({
      userId,
      request: generationRequest,
      workflowId: body.workflowId,
      taskId: body.taskId,
    });

    // Return response
    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      content: result.response.content,
      tokensUsed: result.response.tokensUsed,
      model: result.response.model,
      provider: result.response.provider,
      costUsd: result.response.costUsd,
      latencyMs: result.response.latencyMs,
      approvalGate: result.approvalGate,
    });
  } catch (error) {
    console.error('AI Generation Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Generation API',
    version: '1.0.0 (Phase A)',
    status: 'operational',
    endpoints: {
      generate: 'POST /api/ai/generate',
      health: 'GET /api/ai/health',
    },
  });
}
