/**
 * Orchestrator API Endpoint
 * Main coordination layer for AI task distribution across Claude, ChatGPT, and Javari
 * 
 * Stack: Vercel Edge Function + Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  runtime: 'edge',
};

interface TaskRequest {
  taskType: 'code_generation' | 'documentation' | 'analysis' | 'deployment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  payload: {
    description: string;
    context?: Record<string, any>;
    requiredAgent?: 'claude' | 'chatgpt' | 'javari';
  };
  metadata?: Record<string, any>;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body: TaskRequest = await req.json();

    // Validate required fields
    if (!body.taskType || !body.priority || !body.payload?.description) {
      return NextResponse.json(
        { error: 'Invalid request: taskType, priority, and payload.description are required' },
        { status: 400 }
      );
    }

    // Validate taskType enum
    const validTaskTypes = ['code_generation', 'documentation', 'analysis', 'deployment'];
    if (!validTaskTypes.includes(body.taskType)) {
      return NextResponse.json(
        { error: `Invalid taskType. Must be one of: ${validTaskTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority enum
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine optimal AI agent
    const assignedAgent = determineAgent(body.taskType, body.payload.requiredAgent);

    // Insert task into Supabase ai_tasks table with status=pending
    const { data: task, error: insertError } = await supabase
      .from('ai_tasks')
      .insert({
        task_type: body.taskType,
        priority: body.priority,
        status: 'pending',
        assigned_agent: assignedAgent,
        payload: body.payload,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create task', details: insertError.message },
        { status: 500 }
      );
    }

    // Emit event to ai_events for audit trail
    await emitEvent('task_created', {
      task_id: task.id,
      task_type: body.taskType,
      assigned_agent: assignedAgent,
      priority: body.priority,
    });

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task_id: task.id,
      assigned_agent: assignedAgent,
      status: 'pending',
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return NextResponse.json(
      { error: 'Task orchestration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Determine optimal AI agent based on task type
 */
function determineAgent(
  taskType: string,
  preferredAgent?: 'claude' | 'chatgpt' | 'javari'
): 'claude' | 'chatgpt' | 'javari' {
  if (preferredAgent) return preferredAgent;

  // Smart routing based on task characteristics
  switch (taskType) {
    case 'code_generation':
      return 'claude';
    case 'documentation':
      return 'claude'; // Claude excels at documentation
    case 'analysis':
      return 'javari';
    case 'deployment':
      return 'claude';
    default:
      return 'claude';
  }
}

/**
 * Emit event to ai_events table for audit trail
 */
async function emitEvent(eventType: string, eventData: Record<string, any>): Promise<void> {
  try {
    await supabase.from('ai_events').insert({
      event_type: eventType,
      source: 'orchestrator',
      event_data: eventData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to emit event:', error);
    // Don't throw - event emission failure shouldn't block task creation
  }
}
