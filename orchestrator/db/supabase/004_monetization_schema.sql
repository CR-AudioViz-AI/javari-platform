-- Multi-AI Orchestrator - Phase H: Monetization Layer
-- Supabase Migration 004: Credits, Plans, Billing
-- Created: 2026-01-13

-- ============================================
-- Table: credit_balances
-- Purpose: Track credit balances for users and communities
-- ============================================
CREATE TABLE credit_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    credits_available NUMERIC(12, 2) NOT NULL DEFAULT 0,
    credits_used NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, community_id)
);

CREATE INDEX idx_credit_balances_user ON credit_balances(user_id);
CREATE INDEX idx_credit_balances_community ON credit_balances(community_id);
CREATE INDEX idx_credit_balances_plan ON credit_balances(plan_id);

-- ============================================
-- Table: credit_ledger
-- Purpose: Complete transaction history for credits
-- ============================================
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    community_id UUID,
    delta NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    workflow_id TEXT,
    cost_usd NUMERIC(12, 8),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_community ON credit_ledger(community_id);
CREATE INDEX idx_credit_ledger_workflow ON credit_ledger(workflow_id);
CREATE INDEX idx_credit_ledger_timestamp ON credit_ledger(timestamp DESC);
CREATE INDEX idx_credit_ledger_reason ON credit_ledger(reason);

-- ============================================
-- Table: plans
-- Purpose: Subscription plan definitions
-- ============================================
CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    monthly_credits NUMERIC(12, 2) NOT NULL,
    rollover_enabled BOOLEAN DEFAULT FALSE,
    max_rollover NUMERIC(12, 2),
    features JSONB DEFAULT '{}'::jsonb,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: usage_limits
-- Purpose: Track usage for rate limiting and analytics
-- ============================================
CREATE TABLE usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    community_id UUID,
    workflow_id TEXT,
    credits_spent NUMERIC(12, 2) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_limits_user ON usage_limits(user_id);
CREATE INDEX idx_usage_limits_community ON usage_limits(community_id);
CREATE INDEX idx_usage_limits_period ON usage_limits(period_start, period_end);

-- ============================================
-- Functions for Credit Management
-- ============================================

-- Get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(
    p_user_id TEXT,
    p_community_id UUID DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
    balance NUMERIC;
BEGIN
    SELECT credits_available INTO balance
    FROM credit_balances
    WHERE user_id = p_user_id
    AND (p_community_id IS NULL OR community_id = p_community_id);
    
    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Consume credits (atomic transaction)
CREATE OR REPLACE FUNCTION consume_credits(
    p_user_id TEXT,
    p_community_id UUID,
    p_amount NUMERIC,
    p_reason TEXT,
    p_workflow_id TEXT DEFAULT NULL,
    p_cost_usd NUMERIC DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance NUMERIC;
    new_balance NUMERIC;
BEGIN
    -- Get current balance with row lock
    SELECT credits_available INTO current_balance
    FROM credit_balances
    WHERE user_id = p_user_id
    AND (p_community_id IS NULL OR community_id = p_community_id)
    FOR UPDATE;
    
    -- Check if sufficient credits
    IF current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - p_amount;
    
    -- Update balance
    UPDATE credit_balances
    SET credits_available = new_balance,
        credits_used = credits_used + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND (p_community_id IS NULL OR community_id = p_community_id);
    
    -- Log transaction
    INSERT INTO credit_ledger (
        user_id,
        community_id,
        delta,
        balance_after,
        reason,
        workflow_id,
        cost_usd
    ) VALUES (
        p_user_id,
        p_community_id,
        -p_amount,
        new_balance,
        p_reason,
        p_workflow_id,
        p_cost_usd
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id TEXT,
    p_community_id UUID,
    p_amount NUMERIC,
    p_reason TEXT
) RETURNS NUMERIC AS $$
DECLARE
    new_balance NUMERIC;
BEGIN
    -- Update balance
    UPDATE credit_balances
    SET credits_available = credits_available + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND (p_community_id IS NULL OR community_id = p_community_id)
    RETURNING credits_available INTO new_balance;
    
    -- If no existing balance, create one
    IF new_balance IS NULL THEN
        INSERT INTO credit_balances (
            user_id,
            community_id,
            plan_id,
            credits_available
        ) VALUES (
            p_user_id,
            p_community_id,
            'free',
            p_amount
        ) RETURNING credits_available INTO new_balance;
    END IF;
    
    -- Log transaction
    INSERT INTO credit_ledger (
        user_id,
        community_id,
        delta,
        balance_after,
        reason
    ) VALUES (
        p_user_id,
        p_community_id,
        p_amount,
        new_balance,
        p_reason
    );
    
    RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Auto-update timestamp
CREATE TRIGGER credit_balances_updated_at
    BEFORE UPDATE ON credit_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

-- ============================================
-- Seed Plans
-- ============================================
INSERT INTO plans (id, name, monthly_credits, rollover_enabled, max_rollover, price_usd, features) VALUES
('free', 'Free', 100, FALSE, NULL, 0, '{"max_workflows": 10, "max_communities": 1, "support": "community"}'::jsonb),
('pro', 'Pro', 1000, TRUE, 500, 29.99, '{"max_workflows": -1, "max_communities": 10, "support": "email", "priority_queue": true}'::jsonb),
('enterprise', 'Enterprise', 10000, TRUE, 5000, 299.99, '{"max_workflows": -1, "max_communities": -1, "support": "priority", "priority_queue": true, "custom_models": true, "sla": true}'::jsonb);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE credit_balances IS 'Current credit balances for users and communities';
COMMENT ON TABLE credit_ledger IS 'Complete transaction history for all credit operations';
COMMENT ON TABLE plans IS 'Subscription plan definitions';
COMMENT ON TABLE usage_limits IS 'Usage tracking for rate limiting and analytics';
