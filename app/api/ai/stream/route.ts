/**
 * Multi-AI Orchestrator - Streaming API Endpoint
 * Phase B: POST /api/ai/stream
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdapter } from '@/orchestrator/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const provider = body.provider || 'openai';
    const adapter = createAdapter(provider, body.model);

    if (!adapter) {
      return NextResponse.json({ error: `Provider ${provider} not configured` }, { status: 503 });
    }

    const stream = await adapter.stream({
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      temperature: body.temperature ?? 0.7,
      maxTokens: body.maxTokens ?? 500,
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Streaming failed' }, { status: 500 });
  }
}
