-- Multi-AI Orchestrator - Phase II: Collections Universe (Debt Ops)
-- Supabase Migration 006: Complete Collections Schema
-- Created: 2026-01-13

-- ============================================
-- Table: accounts
-- Purpose: Debtor accounts under collection
-- ============================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    debtor_name TEXT NOT NULL,
    debtor_email TEXT,
    debtor_phone TEXT,
    original_creditor TEXT,
    balance NUMERIC(12, 2) NOT NULL,
    original_balance NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'settled', 'paid', 'disputed', 'closed')),
    state TEXT NOT NULL,
    account_number TEXT,
    charge_off_date DATE,
    last_payment_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_client ON accounts(client_id);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_state ON accounts(state);
CREATE INDEX idx_accounts_debtor ON accounts(debtor_name);
CREATE INDEX idx_accounts_balance ON accounts(balance);
CREATE INDEX idx_accounts_created ON accounts(created_at DESC);

-- ============================================
-- Table: account_notes
-- Purpose: Case notes and communications log
-- ============================================
CREATE TABLE account_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    note TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'call', 'email', 'payment', 'dispute', 'legal')),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_notes_account ON account_notes(account_id);
CREATE INDEX idx_account_notes_user ON account_notes(user_id);
CREATE INDEX idx_account_notes_timestamp ON account_notes(timestamp DESC);
CREATE INDEX idx_account_notes_type ON account_notes(note_type);

-- ============================================
-- Table: account_actions
-- Purpose: Action history and workflow tracking
-- ============================================
CREATE TABLE account_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('call_attempt', 'letter_sent', 'email_sent', 'payment_received', 'dispute_received', 'settlement_offered', 'account_closed')),
    user_id TEXT NOT NULL,
    result TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_actions_account ON account_actions(account_id);
CREATE INDEX idx_account_actions_type ON account_actions(action_type);
CREATE INDEX idx_account_actions_user ON account_actions(user_id);
CREATE INDEX idx_account_actions_timestamp ON account_actions(timestamp DESC);

-- ============================================
-- Table: client_profiles
-- Purpose: Collection agency clients
-- ============================================
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_code TEXT UNIQUE,
    address TEXT,
    contact JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_profiles_code ON client_profiles(client_code);
CREATE INDEX idx_client_profiles_active ON client_profiles(active);

-- ============================================
-- Table: placements
-- Purpose: Account placement batches
-- ============================================
CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    placement_name TEXT NOT NULL,
    assigned_to TEXT,
    account_count INTEGER DEFAULT 0,
    total_balance NUMERIC(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_placements_client ON placements(client_id);
CREATE INDEX idx_placements_assigned ON placements(assigned_to);
CREATE INDEX idx_placements_status ON placements(status);
CREATE INDEX idx_placements_created ON placements(created_at DESC);

-- ============================================
-- Table: account_segments
-- Purpose: Segmentation and scoring data
-- ============================================
CREATE TABLE account_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    segment_type TEXT NOT NULL CHECK (segment_type IN ('risk', 'priority', 'propensity', 'collectability')),
    score NUMERIC(5, 2) NOT NULL,
    segment_label TEXT,
    factors JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(account_id, segment_type)
);

CREATE INDEX idx_account_segments_account ON account_segments(account_id);
CREATE INDEX idx_account_segments_type ON account_segments(segment_type);
CREATE INDEX idx_account_segments_score ON account_segments(score DESC);
CREATE INDEX idx_account_segments_label ON account_segments(segment_label);

-- ============================================
-- Functions for Collections
-- ============================================

-- Auto-update timestamp
CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER client_profiles_updated_at
    BEFORE UPDATE ON client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER placements_updated_at
    BEFORE UPDATE ON placements
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

-- Get account aging (days since charge-off)
CREATE OR REPLACE FUNCTION get_account_age(p_account_id UUID)
RETURNS INTEGER AS $$
DECLARE
    charge_off DATE;
    age INTEGER;
BEGIN
    SELECT charge_off_date INTO charge_off
    FROM accounts
    WHERE id = p_account_id;
    
    IF charge_off IS NULL THEN
        RETURN 0;
    END IF;
    
    age := EXTRACT(DAY FROM (NOW() - charge_off));
    RETURN age;
END;
$$ LANGUAGE plpgsql;

-- Get accounts by segment
CREATE OR REPLACE FUNCTION get_accounts_by_segment(
    p_segment_type TEXT,
    p_min_score NUMERIC DEFAULT 0,
    p_limit INTEGER DEFAULT 100
) RETURNS TABLE(
    account_id UUID,
    debtor_name TEXT,
    balance NUMERIC,
    score NUMERIC,
    segment_label TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.debtor_name,
        a.balance,
        s.score,
        s.segment_label
    FROM accounts a
    JOIN account_segments s ON a.id = s.account_id
    WHERE s.segment_type = p_segment_type
    AND s.score >= p_min_score
    AND a.status = 'active'
    ORDER BY s.score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE accounts IS 'Debtor accounts under collection';
COMMENT ON TABLE account_notes IS 'Case notes and communication history';
COMMENT ON TABLE account_actions IS 'Action history and workflow tracking';
COMMENT ON TABLE client_profiles IS 'Collection agency clients';
COMMENT ON TABLE placements IS 'Account placement batches';
COMMENT ON TABLE account_segments IS 'Account segmentation and scoring';
