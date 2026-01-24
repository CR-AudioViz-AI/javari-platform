-- Migration: ai_events table
-- Purpose: Audit log for all AI system events (tasks, webhooks, errors)
-- Stack: Supabase PostgreSQL

-- Create ai_events table
CREATE TABLE IF NOT EXISTS ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event classification
  event_type TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'orchestrator',
    'github_webhook',
    'javari_chat',
    'javari_background',
    'javari_cron',
    'claude_api',
    'chatgpt_api',
    'manual'
  )),
  
  -- Event details
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Priority (for filtering critical events)
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Relationships
  task_id UUID REFERENCES ai_tasks(id),
  user_id UUID,
  session_id TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_ai_events_event_type ON ai_events(event_type);
CREATE INDEX idx_ai_events_source ON ai_events(source);
CREATE INDEX idx_ai_events_timestamp ON ai_events(timestamp DESC);
CREATE INDEX idx_ai_events_priority ON ai_events(priority);
CREATE INDEX idx_ai_events_task_id ON ai_events(task_id);
CREATE INDEX idx_ai_events_user_id ON ai_events(user_id);

-- Create GIN index for JSONB queries
CREATE INDEX idx_ai_events_event_data_gin ON ai_events USING GIN (event_data);
CREATE INDEX idx_ai_events_metadata_gin ON ai_events USING GIN (metadata);

-- TODO: Add RLS policies
-- ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- TODO: Create policy for service role access only
-- CREATE POLICY "Service role full access" ON ai_events
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- TODO: Add retention policy - auto-delete events older than 90 days
-- CREATE OR REPLACE FUNCTION delete_old_events()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM ai_events
--   WHERE timestamp < NOW() - INTERVAL '90 days'
--   AND priority NOT IN ('critical', 'high');
-- END;
-- $$ LANGUAGE plpgsql;

-- TODO: Schedule daily cleanup job
-- SELECT cron.schedule(
--   'delete-old-events',
--   '0 2 * * *', -- 2 AM daily
--   'SELECT delete_old_events();'
-- );

-- TODO: Add function to aggregate events by type and time period
-- CREATE OR REPLACE FUNCTION event_summary(
--   start_time TIMESTAMPTZ,
--   end_time TIMESTAMPTZ
-- )
-- RETURNS TABLE(
--   event_type TEXT,
--   source TEXT,
--   count BIGINT
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT 
--     e.event_type,
--     e.source,
--     COUNT(*) as count
--   FROM ai_events e
--   WHERE e.timestamp >= start_time
--     AND e.timestamp <= end_time
--   GROUP BY e.event_type, e.source
--   ORDER BY count DESC;
-- END;
-- $$ LANGUAGE plpgsql;

-- TODO: Add function to detect anomalous event patterns
-- TODO: Add function to export events for external analysis

-- Sample data for testing (remove in production)
-- INSERT INTO ai_events (event_type, source, event_data, priority) VALUES
--   ('task_created', 'orchestrator', '{"task_id": "123", "type": "code_generation"}'::jsonb, 'medium'),
--   ('github_push', 'github_webhook', '{"repository": "crav-docs", "commits": 3}'::jsonb, 'low'),
--   ('claude_task_completed', 'claude_api', '{"task_id": "123", "execution_time": 2500}'::jsonb, 'medium'),
--   ('knowledge_gap', 'javari_chat', '{"query": "How do I deploy to Vercel?", "user_id": "456"}'::jsonb, 'high');

COMMENT ON TABLE ai_events IS 'Comprehensive audit log for all AI orchestration events';
COMMENT ON COLUMN ai_events.event_data IS 'JSONB containing event-specific data and context';
COMMENT ON COLUMN ai_events.metadata IS 'JSONB for additional event metadata (tags, correlations, etc.)';
COMMENT ON COLUMN ai_events.priority IS 'Event priority for filtering and alerting';
