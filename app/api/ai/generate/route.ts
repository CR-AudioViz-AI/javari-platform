/**
 * Multi-AI Orchestrator - Generate API Endpoint
 * Phase B: Enhanced with multi-provider support
 * 
 * POST /api/ai/generate
 * Handles AI generation requests through the enhanced orchestrator
 */

import { NextRequest, NextResponse } from 'next/server';
import { RouterEngine } from '@/orchestrator/router/router';
import { v4 as uuidv4 } from 'uuid';
import type { LLMGenerationRequest } from '@/orchestrator/types/llm-adapter';
import type { GenerationMetadata } from '@/orchestrator/types/generation';

// Initialize router (singleton pattern)
let router: RouterEngine | null = null;

function getRouter(): RouterEngine {
  if (!router) {
    router = new RouterEngine({
      routingStrategy: 'cheapest', // or 'fastest', 'specified'
      autoApproveThresholdUSD: 1.0,
      enableAudit: true,
      enableFallback: true,
      maxRetries: 2,
    });
  }
  return router;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Extract user ID (in Phase B, could come from auth)
    const userId = body.userId || 'default-user';

    // Build generation request
    const generationRequest: LLMGenerationRequest = {
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      temperature: body.temperature ?? 0.7,
      maxTokens: body.maxTokens ?? 500,
      stopSequences: body.stopSequences,
      metadata: body.metadata,
    };

    // Build metadata
    const metadata: GenerationMetadata = {
      requestId: uuidv4(),
      userId,
      timestamp: new Date(),
      priority: body.priority || 'normal',
      tags: body.tags,
      context: body.context,
    };

    // Route through orchestrator
    const router = getRouter();
    const result = await router.route(
      generationRequest, 
      metadata,
      body.provider // Optional: specify preferred provider
    );

    // Return result
    if (result.status === 'completed') {
      return NextResponse.json({
        success: true,
        requestId: result.requestId,
        content: result.content,
        usage: result.usage,
        costUSD: result.costUSD,
        latencyMs: result.latencyMs,
        provider: result.provider,
        model: result.model,
      });
    } else if (result.status === 'requires_approval') {
      return NextResponse.json({
        success: false,
        requiresApproval: true,
        requestId: result.requestId,
        reason: result.error,
        provider: result.provider,
        model: result.model,
      }, { status: 402 });
    } else {
      return NextResponse.json({
        success: false,
        requestId: result.requestId,
        error: result.error,
        status: result.status,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in /api/ai/generate:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
