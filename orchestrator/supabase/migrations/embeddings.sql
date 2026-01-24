-- Migration: embeddings table
-- Purpose: Store semantic embeddings for knowledge base and vector search
-- Stack: Supabase PostgreSQL + pgvector extension

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content and metadata
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  
  -- Vector embedding (1536 dimensions for OpenAI text-embedding-ada-002)
  embedding vector(1536) NOT NULL,
  
  -- Chunking metadata
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Versioning and lifecycle
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- Create indexes for efficient querying
CREATE INDEX idx_embeddings_source ON embeddings(source);
CREATE INDEX idx_embeddings_category ON embeddings(category);
CREATE INDEX idx_embeddings_created_at ON embeddings(created_at DESC);
CREATE INDEX idx_embeddings_is_active ON embeddings(is_active) WHERE is_active = true;

-- Create GIN index for JSONB metadata
CREATE INDEX idx_embeddings_metadata_gin ON embeddings USING GIN (metadata);

-- Create vector index for similarity search using HNSW algorithm
CREATE INDEX idx_embeddings_vector_hnsw ON embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- TODO: Add RLS policies
-- ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- TODO: Create policy for service role access only
-- CREATE POLICY "Service role full access" ON embeddings
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- TODO: Function for semantic search with filters
-- CREATE OR REPLACE FUNCTION search_embeddings(
--   query_embedding vector(1536),
--   match_threshold FLOAT DEFAULT 0.7,
--   match_count INT DEFAULT 10,
--   filter_category TEXT DEFAULT NULL,
--   filter_source TEXT DEFAULT NULL
-- )
-- RETURNS TABLE (
--   id UUID,
--   content TEXT,
--   source TEXT,
--   category TEXT,
--   similarity FLOAT,
--   metadata JSONB
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT
--     e.id,
--     e.content,
--     e.source,
--     e.category,
--     1 - (e.embedding <=> query_embedding) as similarity,
--     e.metadata
--   FROM embeddings e
--   WHERE e.is_active = true
--     AND (filter_category IS NULL OR e.category = filter_category)
--     AND (filter_source IS NULL OR e.source = filter_source)
--     AND 1 - (e.embedding <=> query_embedding) > match_threshold
--   ORDER BY e.embedding <=> query_embedding
--   LIMIT match_count;
-- END;
-- $$ LANGUAGE plpgsql;

-- TODO: Function to update embedding timestamp
-- CREATE OR REPLACE FUNCTION update_embedding_timestamp()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_update_embedding_timestamp
--   BEFORE UPDATE ON embeddings
--   FOR EACH ROW
--   EXECUTE FUNCTION update_embedding_timestamp();

-- TODO: Function to mark old versions as inactive when new version is inserted
-- CREATE OR REPLACE FUNCTION manage_embedding_versions()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Deactivate old versions with same source and chunk_index
--   UPDATE embeddings
--   SET is_active = false
--   WHERE source = NEW.source
--     AND chunk_index = NEW.chunk_index
--     AND id != NEW.id
--     AND is_active = true;
--   
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_manage_embedding_versions
--   AFTER INSERT ON embeddings
--   FOR EACH ROW
--   EXECUTE FUNCTION manage_embedding_versions();

-- TODO: Function to auto-expire old embeddings
-- CREATE OR REPLACE FUNCTION expire_old_embeddings()
-- RETURNS void AS $$
-- BEGIN
--   UPDATE embeddings
--   SET is_active = false
--   WHERE expires_at IS NOT NULL
--     AND expires_at < NOW()
--     AND is_active = true;
-- END;
-- $$ LANGUAGE plpgsql;

-- TODO: Schedule daily expiration check
-- SELECT cron.schedule(
--   'expire-embeddings',
--   '0 1 * * *', -- 1 AM daily
--   'SELECT expire_old_embeddings();'
-- );

-- TODO: Hybrid search combining vector similarity and keyword matching
-- TODO: Function to deduplicate similar embeddings based on cosine similarity
-- TODO: Function to aggregate related chunks for complete context retrieval

COMMENT ON TABLE embeddings IS 'Semantic embeddings for knowledge base with vector search capabilities';
COMMENT ON COLUMN embeddings.embedding IS '1536-dimensional vector from OpenAI text-embedding-ada-002';
COMMENT ON COLUMN embeddings.is_active IS 'Flag to mark active version (supports versioning without deletion)';
COMMENT ON COLUMN embeddings.expires_at IS 'Optional expiration timestamp for time-sensitive knowledge';
