/**
 * Multi-AI Orchestrator - Supabase Client
 * Phase C: Database integration
 * 
 * SECURITY: Never logs credentials, loads from environment variables
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types (generated from schema)
export interface AuditLogEntry {
  id?: string;
  event_id: string;
  event_type: string;
  timestamp?: Date;
  user_id: string;
  request_id?: string;
  provider?: string;
  model?: string;
  input_hash?: string;
  tokens_in?: number;
  tokens_out?: number;
  total_tokens?: number;
  latency_ms?: number;
  cost_usd?: number;
  routing_decision?: string;
  fallback_used?: boolean;
  status?: string;
  error?: string;
  request_body?: any;
  response_body?: any;
  metadata?: any;
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  version: number;
  definition: any;
  status: 'active' | 'archived' | 'draft';
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface WorkflowRun {
  id?: string;
  workflow_id: string;
  workflow_name: string;
  workflow_version: number;
  user_id: string;
  started_at?: Date;
  finished_at?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: any[];
  error?: string;
  total_cost_usd?: number;
  total_latency_ms?: number;
  metadata?: any;
}

export interface CacheEntry {
  id?: string;
  request_hash: string;
  provider: string;
  model: string;
  request_body: any;
  response_body: any;
  tokens_in?: number;
  tokens_out?: number;
  cost_usd?: number;
  created_at?: Date;
  expires_at: Date;
  hit_count?: number;
  last_hit_at?: Date;
}

let supabaseClient: SupabaseClient | null = null;
let connectionError: string | null = null;

/**
 * Initialize Supabase client from environment variables
 */
function initializeSupabase(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    connectionError = 'Supabase credentials not configured (SUPABASE_URL or SUPABASE_ANON_KEY missing)';
    console.warn(`[Supabase] ${connectionError}`);
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    console.log('[Supabase] Client initialized successfully');
    return supabaseClient;
  } catch (error) {
    connectionError = `Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`[Supabase] ${connectionError}`);
    return null;
  }
}

/**
 * Get Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient | null {
  return initializeSupabase();
}

/**
 * Check if Supabase is configured and connected
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Get connection error message if any
 */
export function getConnectionError(): string | null {
  return connectionError;
}

/**
 * Typed database operations
 */
export const db = {
  auditLog: {
    async insert(entry: AuditLogEntry) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_audit_log')
        .insert(entry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async query(filters: { userId?: string; provider?: string; limit?: number; offset?: number }) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      let query = client
        .from('ai_audit_log')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.provider) query = query.eq('provider', filters.provider);
      if (filters.limit) query = query.limit(filters.limit);
      if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },

  workflows: {
    async create(workflow: Workflow) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_workflows')
        .insert(workflow)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async get(id: string) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_workflows')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async list(status?: string) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      let query = client.from('ai_workflows').select('*');
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },

  workflowRuns: {
    async create(run: WorkflowRun) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_workflow_runs')
        .insert(run)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<WorkflowRun>) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_workflow_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async list(filters: { workflowId?: string; userId?: string; limit?: number }) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      let query = client
        .from('ai_workflow_runs')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (filters.workflowId) query = query.eq('workflow_id', filters.workflowId);
      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.limit) query = query.limit(filters.limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },

  cache: {
    async get(requestHash: string) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_cache')
        .select('*')
        .eq('request_hash', requestHash)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    },

    async set(entry: CacheEntry) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { data, error } = await client
        .from('ai_cache')
        .upsert(entry, { onConflict: 'request_hash' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async incrementHit(requestHash: string) {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured');
      
      const { error } = await client.rpc('increment_cache_hit', {
        hash: requestHash,
      });
      
      if (error) {
        // Fallback if RPC doesn't exist
        await client
          .from('ai_cache')
          .update({
            hit_count: client.raw('hit_count + 1'),
            last_hit_at: new Date().toISOString(),
          })
          .eq('request_hash', requestHash);
      }
    },
  },
};
