-- Migration: ai_tasks table
-- Purpose: Track AI task assignments, status, and results
-- Stack: Supabase PostgreSQL

-- Create ai_tasks table
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task metadata
  task_type TEXT NOT NULL CHECK (task_type IN (
    'code_generation',
    'documentation', 
    'analysis',
    'deployment',
    'research',
    'review'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  
  -- Agent assignment
  assigned_agent TEXT NOT NULL CHECK (assigned_agent IN ('claude', 'chatgpt', 'javari')),
  
  -- Task payload
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  result JSONB,
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Performance tracking
  execution_time_ms INTEGER,
  api_cost_cents INTEGER,
  
  -- Relationships
  parent_task_id UUID REFERENCES ai_tasks(id),
  triggered_by_event_id UUID
);

-- Create indexes for common queries
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_assigned_agent ON ai_tasks(assigned_agent);
CREATE INDEX idx_ai_tasks_task_type ON ai_tasks(task_type);
CREATE INDEX idx_ai_tasks_priority ON ai_tasks(priority);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at DESC);
CREATE INDEX idx_ai_tasks_parent_task_id ON ai_tasks(parent_task_id);

-- TODO: Add RLS policies for secure access
-- ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- TODO: Create policy for service role access only
-- CREATE POLICY "Service role full access" ON ai_tasks
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- TODO: Add function to auto-update execution_time_ms
-- CREATE OR REPLACE FUNCTION update_task_execution_time()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
--     NEW.execution_time_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_update_execution_time
--   BEFORE UPDATE ON ai_tasks
--   FOR EACH ROW
--   EXECUTE FUNCTION update_task_execution_time();

-- TODO: Add function to calculate API costs based on agent and tokens used
-- TODO: Add function to auto-retry failed tasks based on retry policy
-- TODO: Add function to cascade cancel child tasks when parent is cancelled

-- Sample data for testing (remove in production)
-- INSERT INTO ai_tasks (task_type, priority, assigned_agent, payload) VALUES
--   ('code_generation', 'high', 'claude', '{"description": "Generate TypeScript types for user model"}'::jsonb),
--   ('documentation', 'medium', 'chatgpt', '{"description": "Update API documentation for new endpoints"}'::jsonb),
--   ('analysis', 'low', 'javari', '{"description": "Analyze user engagement patterns"}'::jsonb);

COMMENT ON TABLE ai_tasks IS 'Orchestrator task queue for multi-agent AI system';
COMMENT ON COLUMN ai_tasks.payload IS 'JSONB containing task-specific parameters and context';
COMMENT ON COLUMN ai_tasks.result IS 'JSONB containing task execution results';
COMMENT ON COLUMN ai_tasks.execution_time_ms IS 'Task execution duration in milliseconds (auto-calculated)';
