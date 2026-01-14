-- Multi-AI Orchestrator - Phase C Database Schema
-- Supabase Migration 001: Initial Schema
-- Created: 2026-01-13

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: ai_audit_log
-- Purpose: Persistent audit trail for all AI requests
-- ============================================
CREATE TABLE ai_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    request_id TEXT,
    provider TEXT,
    model TEXT,
    input_hash TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER,
    total_tokens INTEGER,
    latency_ms INTEGER,
    cost_usd DECIMAL(10, 6),
    routing_decision TEXT,
    fallback_used BOOLEAN DEFAULT FALSE,
    status TEXT,
    error TEXT,
    request_body JSONB,
    response_body JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_log_timestamp ON ai_audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON ai_audit_log(user_id);
CREATE INDEX idx_audit_log_provider ON ai_audit_log(provider);
CREATE INDEX idx_audit_log_event_type ON ai_audit_log(event_type);
CREATE INDEX idx_audit_log_request_id ON ai_audit_log(request_id);
CREATE INDEX idx_audit_log_input_hash ON ai_audit_log(input_hash);

-- ============================================
-- Table: ai_workflows
-- Purpose: Store workflow definitions
-- ============================================
CREATE TABLE ai_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    definition JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, archived, draft
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, version)
);

CREATE INDEX idx_workflows_name ON ai_workflows(name);
CREATE INDEX idx_workflows_status ON ai_workflows(status);

-- ============================================
-- Table: ai_workflow_runs
-- Purpose: Track workflow execution history
-- ============================================
CREATE TABLE ai_workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_version INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed, cancelled
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    error TEXT,
    total_cost_usd DECIMAL(10, 6),
    total_latency_ms INTEGER,
    metadata JSONB
);

CREATE INDEX idx_workflow_runs_workflow_id ON ai_workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_user_id ON ai_workflow_runs(user_id);
CREATE INDEX idx_workflow_runs_status ON ai_workflow_runs(status);
CREATE INDEX idx_workflow_runs_started_at ON ai_workflow_runs(started_at DESC);

-- ============================================
-- Table: ai_cache
-- Purpose: Cache AI responses for deduplication
-- ============================================
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_hash TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    request_body JSONB NOT NULL,
    response_body JSONB NOT NULL,
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost_usd DECIMAL(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMPTZ
);

CREATE INDEX idx_cache_request_hash ON ai_cache(request_hash);
CREATE INDEX idx_cache_expires_at ON ai_cache(expires_at);
CREATE INDEX idx_cache_provider ON ai_cache(provider);

-- ============================================
-- Table: ai_analytics_summary
-- Purpose: Pre-computed analytics for performance
-- ============================================
CREATE TABLE ai_analytics_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    provider TEXT NOT NULL,
    total_requests INTEGER NOT NULL DEFAULT 0,
    total_tokens_in INTEGER NOT NULL DEFAULT 0,
    total_tokens_out INTEGER NOT NULL DEFAULT 0,
    total_cost_usd DECIMAL(12, 6) NOT NULL DEFAULT 0,
    avg_latency_ms INTEGER,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    cache_hit_count INTEGER NOT NULL DEFAULT 0,
    fallback_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_start, period_end, provider)
);

CREATE INDEX idx_analytics_period ON ai_analytics_summary(period_start, period_end);
CREATE INDEX idx_analytics_provider ON ai_analytics_summary(provider);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_workflows_updated_at 
    BEFORE UPDATE ON ai_workflows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Grant permissions (adjust as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
