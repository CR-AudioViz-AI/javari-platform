/**
 * Supabase Edge Function: processClaudeTask
 * Executes tasks assigned to Claude via Anthropic API
 * 
 * Stack: Supabase Edge Functions + Anthropic API + GitHub API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  try {
    // Read next pending task from ai_tasks table
    const { data: tasks, error: fetchError } = await supabase
      .from('ai_tasks')
      .select('*')
      .eq('status', 'pending')
      .eq('assigned_agent', 'claude')
      .order('priority', { ascending: false }) // critical > high > medium > low
      .order('created_at', { ascending: true }) // oldest first
      .limit(1);

    if (fetchError) {
      throw new Error(`Failed to fetch pending task: ${fetchError.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending tasks found' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const task = tasks[0];
    const taskId = task.id;

    // Update task status to 'processing'
    await supabase
      .from('ai_tasks')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', taskId);

    // Build Claude API request
    const messages = [
      {
        role: 'user',
        content: task.payload.description,
      },
    ];

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: task.payload.systemPrompt || 'You are a helpful AI assistant for the CRAudioVizAI platform.',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const claudeResult = await response.json();
    const content = claudeResult.content[0].text;

    // Commit file to GitHub using GitHub API
    const fileName = task.payload.context?.fileName || `task-${taskId}.md`;
    const filePath = task.payload.context?.filePath || `outputs/${fileName}`;
    const repository = task.payload.context?.repository || 'CR-AudioViz-AI/crav-docs';
    const branch = task.payload.context?.branch || 'main';

    const fileContentBase64 = btoa(content);

    // Check if file exists to get SHA (required for updates)
    const checkFileResponse = await fetch(
      `https://api.github.com/repos/${repository}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let existingFileSha = null;
    if (checkFileResponse.ok) {
      const existingFile = await checkFileResponse.json();
      existingFileSha = existingFile.sha;
    }

    // Commit file to GitHub
    const commitPayload: any = {
      message: `AI Task ${taskId}: ${task.payload.description.substring(0, 50)}...`,
      content: fileContentBase64,
      branch,
    };

    if (existingFileSha) {
      commitPayload.sha = existingFileSha;
    }

    const commitResponse = await fetch(
      `https://api.github.com/repos/${repository}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitPayload),
      }
    );

    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`GitHub commit failed: ${commitResponse.status} ${errorText}`);
    }

    const commitResult = await commitResponse.json();
    const commitSha = commitResult.commit.sha;

    // Update ai_tasks → done
    await supabase
      .from('ai_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: {
          content,
          github_commit: commitSha,
          github_url: commitResult.content.html_url,
          raw_response: claudeResult,
        },
      })
      .eq('id', taskId);

    // Insert ai_events → {event_type:"commit"}
    await supabase.from('ai_events').insert({
      event_type: 'commit',
      source: 'claude_api',
      event_data: {
        task_id: taskId,
        commit_sha: commitSha,
        repository,
        file_path: filePath,
        branch,
      },
      timestamp: new Date().toISOString(),
      task_id: taskId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        taskId,
        commit_sha: commitSha,
        github_url: commitResult.content.html_url,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('processClaudeTask error:', error);

    // Try to update task status to 'failed' if we have taskId
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        error: 'Task processing failed',
        details: errorMessage,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
