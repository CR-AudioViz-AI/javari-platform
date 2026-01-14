-- Multi-AI Orchestrator - Phase E: Cost Ledger & Analytics
-- Supabase Migration 002: Cost Intelligence Schema
-- Created: 2026-01-13

-- ============================================
-- Table: ai_cost_ledger
-- Purpose: Financial tracking for all AI operations
-- ============================================
CREATE TABLE ai_cost_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER GENERATED ALWAYS AS (tokens_in + tokens_out) STORED,
    cost_usd NUMERIC(12, 8) NOT NULL,
    workflow_id UUID,
    workflow_name TEXT,
    user_id TEXT NOT NULL,
    cache_hit BOOLEAN DEFAULT FALSE,
    fallback_used BOOLEAN DEFAULT FALSE,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cost_ledger_timestamp ON ai_cost_ledger(timestamp DESC);
CREATE INDEX idx_cost_ledger_provider ON ai_cost_ledger(provider);
CREATE INDEX idx_cost_ledger_workflow ON ai_cost_ledger(workflow_id) WHERE workflow_id IS NOT NULL;
CREATE INDEX idx_cost_ledger_user ON ai_cost_ledger(user_id);
CREATE INDEX idx_cost_ledger_anomaly ON ai_cost_ledger(anomaly_flag) WHERE anomaly_flag = TRUE;
CREATE INDEX idx_cost_ledger_cache_hit ON ai_cost_ledger(cache_hit);

-- ============================================
-- Table: ai_provider_pricing
-- Purpose: Provider pricing configuration
-- ============================================
CREATE TABLE ai_provider_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    cost_per_1m_input NUMERIC(10, 4) NOT NULL,
    cost_per_1m_output NUMERIC(10, 4) NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, model, effective_date)
);

CREATE INDEX idx_pricing_provider_model ON ai_provider_pricing(provider, model);
CREATE INDEX idx_pricing_effective_date ON ai_provider_pricing(effective_date DESC);

-- ============================================
-- Table: ai_cost_alerts
-- Purpose: Cost anomaly and threshold alerts
-- ============================================
CREATE TABLE ai_cost_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL, -- 'threshold', 'anomaly', 'drift', 'spike'
    severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
    provider TEXT,
    workflow_id UUID,
    user_id TEXT,
    threshold_value NUMERIC(10, 4),
    actual_value NUMERIC(10, 4),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_alerts_created ON ai_cost_alerts(created_at DESC);
CREATE INDEX idx_cost_alerts_severity ON ai_cost_alerts(severity);
CREATE INDEX idx_cost_alerts_resolved ON ai_cost_alerts(resolved);

-- ============================================
-- Functions for Cost Analytics
-- ============================================

-- Get total spend for a time range
CREATE OR REPLACE FUNCTION get_total_spend(
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
) RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(cost_usd) FROM ai_cost_ledger 
         WHERE timestamp BETWEEN start_time AND end_time),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Get provider cost breakdown
CREATE OR REPLACE FUNCTION get_provider_breakdown(
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
) RETURNS TABLE(
    provider TEXT,
    total_cost NUMERIC,
    request_count BIGINT,
    avg_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.provider,
        SUM(l.cost_usd)::NUMERIC as total_cost,
        COUNT(*)::BIGINT as request_count,
        AVG(l.cost_usd)::NUMERIC as avg_cost
    FROM ai_cost_ledger l
    WHERE l.timestamp BETWEEN start_time AND end_time
    GROUP BY l.provider
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql;

-- Detect cost anomalies (>2x historical average)
CREATE OR REPLACE FUNCTION detect_cost_anomaly(
    current_cost NUMERIC,
    provider_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    historical_avg NUMERIC;
BEGIN
    -- Get 30-day average for this provider
    SELECT AVG(cost_usd) INTO historical_avg
    FROM ai_cost_ledger
    WHERE provider = provider_name
    AND timestamp > NOW() - INTERVAL '30 days';
    
    -- No history, not an anomaly
    IF historical_avg IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current cost is >2x average
    RETURN current_cost > (historical_avg * 2);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE ai_cost_ledger IS 'Financial tracking for all AI operations with anomaly detection';
COMMENT ON TABLE ai_provider_pricing IS 'Provider pricing configuration and history';
COMMENT ON TABLE ai_cost_alerts IS 'Cost anomaly and threshold alerts';
