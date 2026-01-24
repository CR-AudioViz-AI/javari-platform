/**
 * Javari Events API Endpoint
 * Handles platform-specific events from Javari AI system
 * 
 * Stack: Vercel Edge Function + Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  runtime: 'edge',
};

interface JavariEventPayload {
  eventType: 
    | 'user_query' 
    | 'task_completed' 
    | 'knowledge_gap' 
    | 'error_detected'
    | 'learning_opportunity'
    | 'blueprint_updated';
  source: 'javari_chat' | 'javari_background' | 'javari_cron' | 'updateKnowledge';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  data: {
    userId?: string;
    sessionId?: string;
    query?: string;
    result?: any;
    error?: string;
    context?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const event: JavariEventPayload = await req.json();

    // Validate event structure
    if (!event.eventType || !event.source) {
      return NextResponse.json(
        { error: 'Invalid event: eventType and source are required' },
        { status: 400 }
      );
    }

    // Log event to ai_events table
    const { error: insertError } = await supabase.from('ai_events').insert({
      event_type: event.eventType,
      source: event.source,
      event_data: event.data || {},
      priority: event.priority || 'medium',
      timestamp: new Date().toISOString(),
      metadata: event.metadata || {},
    });

    if (insertError) {
      console.error('Failed to log Javari event:', insertError);
      return NextResponse.json(
        { error: 'Failed to log event', details: insertError.message },
        { status: 500 }
      );
    }

    // Respond with 200 OK
    return NextResponse.json({
      success: true,
      eventType: event.eventType,
      source: event.source,
      processed: true,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Javari event processing error:', error);
    return NextResponse.json(
      { error: 'Event processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
