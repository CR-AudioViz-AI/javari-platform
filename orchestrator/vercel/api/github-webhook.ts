/**
 * GitHub Webhook Handler
 * Processes GitHub events (push, PR, issues) and triggers AI workflows
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

interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    name: string;
    full_name: string;
    private: boolean;
  };
  sender?: {
    login: string;
    type: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
  pull_request?: {
    number: number;
    title: string;
    state: string;
  };
  ref?: string; // branch reference (e.g., "refs/heads/main")
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const eventType = req.headers.get('x-github-event');
    const payload: GitHubWebhookPayload = await req.json();

    // Log all events to ai_events table
    await supabase.from('ai_events').insert({
      event_type: `github_${eventType}`,
      source: 'github_webhook',
      event_data: payload,
      timestamp: new Date().toISOString(),
      metadata: {
        repository: payload.repository?.full_name,
        sender: payload.sender?.login,
      },
    });

    // Handle push events specifically - insert as "commit" event type
    if (eventType === 'push' && payload.commits && payload.commits.length > 0) {
      // Insert commit event for each commit
      for (const commit of payload.commits) {
        await supabase.from('ai_events').insert({
          event_type: 'commit',
          source: 'github_webhook',
          event_data: {
            commit_id: commit.id,
            commit_message: commit.message,
            author: commit.author,
            repository: payload.repository?.full_name,
            branch: payload.ref?.replace('refs/heads/', ''),
            files_added: commit.added || [],
            files_modified: commit.modified || [],
            files_removed: commit.removed || [],
          },
          timestamp: new Date().toISOString(),
          metadata: {
            repository: payload.repository?.full_name,
            branch: payload.ref?.replace('refs/heads/', ''),
          },
        });
      }

      // Check if documentation files were updated
      const hasDocChanges = payload.commits.some(commit => 
        [...(commit.added || []), ...(commit.modified || [])].some(file => 
          file.endsWith('.md') || file.includes('/docs/')
        )
      );

      // If docs changed, trigger knowledge update
      if (hasDocChanges) {
        console.log('Documentation changes detected, triggering knowledge update');
        // The processClaudeTask function will handle this via database triggers
      }
    }

    return NextResponse.json({
      success: true,
      event: eventType,
      processed: true,
      commits_logged: payload.commits?.length || 0,
    });

  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
