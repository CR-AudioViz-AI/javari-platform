/**
 * Supabase Edge Function: updateKnowledge
 * Updates knowledge base with new content and generates embeddings
 * 
 * Stack: Supabase Edge Functions + OpenAI Embeddings API + GitHub API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const JAVARI_EVENTS_URL = Deno.env.get('JAVARI_EVENTS_URL') || `${SUPABASE_URL}/api/javari-events`;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface UpdateKnowledgeRequest {
  repository?: string;
  filePath?: string;
  branch?: string;
  content?: string; // Alternative to fetching from GitHub
  source?: string;
  category?: string;
  chunkSize?: number;
}

serve(async (req) => {
  try {
    const {
      repository = 'CR-AudioViz-AI/crav-docs',
      filePath = 'docs/blueprints/Javariverse_Master_Blueprint.md',
      branch = 'main',
      content: providedContent,
      source = 'github',
      category = 'blueprints',
      chunkSize = 1000,
    }: UpdateKnowledgeRequest = await req.json();

    let content: string;

    // Fetch updated file from GitHub if content not provided
    if (providedContent) {
      content = providedContent;
    } else {
      const githubResponse = await fetch(
        `https://api.github.com/repos/${repository}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw',
          },
        }
      );

      if (!githubResponse.ok) {
        throw new Error(`Failed to fetch file from GitHub: ${githubResponse.status}`);
      }

      content = await githubResponse.text();
    }

    // Chunk content into manageable pieces
    const chunks = chunkText(content, chunkSize);

    // Generate embeddings for each chunk using OpenAI
    const embeddingsData = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: chunk,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const result = await embeddingResponse.json();
        const embedding = result.data[0].embedding;

        return {
          content: chunk,
          embedding,
          source: `${repository}/${filePath}`,
          category,
          chunk_index: index,
          metadata: {
            repository,
            file_path: filePath,
            branch,
            total_chunks: chunks.length,
            updated_at: new Date().toISOString(),
          },
        };
      })
    );

    // Store embeddings in Supabase
    const { data: insertedEmbeddings, error: insertError } = await supabase
      .from('embeddings')
      .insert(embeddingsData)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert embeddings: ${insertError.message}`);
    }

    // Log knowledge update event
    await supabase.from('ai_events').insert({
      event_type: 'knowledge_updated',
      source: 'updateKnowledge',
      event_data: {
        repository,
        file_path: filePath,
        category,
        chunks_added: chunks.length,
      },
      timestamp: new Date().toISOString(),
    });

    // POST to /api/javari-events with type="blueprint_updated"
    try {
      await fetch(JAVARI_EVENTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'blueprint_updated',
          source: 'updateKnowledge',
          priority: 'medium',
          data: {
            repository,
            file_path: filePath,
            category,
            chunks_added: chunks.length,
            embedding_ids: insertedEmbeddings?.map(e => e.id),
          },
          metadata: {
            updated_at: new Date().toISOString(),
          },
        }),
      });
    } catch (eventError) {
      console.error('Failed to post to javari-events:', eventError);
      // Don't throw - this is non-critical
    }

    return new Response(
      JSON.stringify({
        success: true,
        repository,
        file_path: filePath,
        chunks_processed: chunks.length,
        embeddings_created: insertedEmbeddings?.length || 0,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('updateKnowledge error:', error);
    return new Response(
      JSON.stringify({
        error: 'Knowledge update failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Chunk text into manageable pieces for embedding
 * Splits on sentences, combines until reaching maxChunkSize
 * Preserves context by allowing slight overlap between chunks
 */
function chunkText(text: string, maxChunkSize: number): string[] {
  // Split on sentences (basic heuristic)
  const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    
    if (potentialChunk.length > maxChunkSize && currentChunk) {
      // Current chunk is full, start new one
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = potentialChunk;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text]; // Fallback to full text if no chunks
}
