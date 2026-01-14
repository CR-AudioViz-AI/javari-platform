-- Multi-AI Orchestrator - Phase III: Collectibles Universe
-- Supabase Migration 007: Complete Collectibles Schema
-- Created: 2026-01-13

-- ============================================
-- Table: collectibles
-- Purpose: Core collectibles inventory
-- ============================================
CREATE TABLE collectibles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id TEXT NOT NULL,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    year INTEGER,
    condition TEXT CHECK (condition IN ('mint', 'excellent', 'good', 'fair', 'poor', 'unknown')),
    acquisition_cost NUMERIC(12, 2),
    acquisition_date DATE,
    provenance JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    last_valuation NUMERIC(12, 2),
    last_valuation_date TIMESTAMPTZ,
    status TEXT DEFAULT 'owned' CHECK (status IN ('owned', 'sold', 'trading', 'wishlist')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collectibles_owner ON collectibles(owner_user_id);
CREATE INDEX idx_collectibles_category ON collectibles(category_id);
CREATE INDEX idx_collectibles_community ON collectibles(community_id);
CREATE INDEX idx_collectibles_status ON collectibles(status);
CREATE INDEX idx_collectibles_year ON collectibles(year);
CREATE INDEX idx_collectibles_created ON collectibles(created_at DESC);

-- ============================================
-- Table: collectible_images
-- Purpose: Image gallery for collectibles
-- ============================================
CREATE TABLE collectible_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    image_type TEXT DEFAULT 'photo' CHECK (image_type IN ('photo', 'certificate', 'provenance', 'detail')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collectible_images_collectible ON collectible_images(collectible_id);
CREATE INDEX idx_collectible_images_type ON collectible_images(image_type);

-- ============================================
-- Table: collectible_attributes
-- Purpose: Category-specific attributes (JSONB)
-- ============================================
CREATE TABLE collectible_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(collectible_id)
);

CREATE INDEX idx_collectible_attributes_collectible ON collectible_attributes(collectible_id);
CREATE INDEX idx_collectible_attributes_data ON collectible_attributes USING gin(data);

-- ============================================
-- Table: valuations
-- Purpose: AI-generated valuations
-- ============================================
CREATE TABLE valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    estimated_value NUMERIC(12, 2) NOT NULL,
    confidence NUMERIC(3, 2),
    value_range_low NUMERIC(12, 2),
    value_range_high NUMERIC(12, 2),
    methodology TEXT,
    raw_output JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_valuations_collectible ON valuations(collectible_id);
CREATE INDEX idx_valuations_provider ON valuations(provider);
CREATE INDEX idx_valuations_created ON valuations(created_at DESC);

-- ============================================
-- Table: valuation_sources
-- Purpose: Market data sources for valuations
-- ============================================
CREATE TABLE valuation_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valuation_id UUID NOT NULL REFERENCES valuations(id) ON DELETE CASCADE,
    source_type TEXT CHECK (source_type IN ('auction', 'retail', 'peer_sale', 'price_guide')),
    source_name TEXT,
    comparable_item TEXT,
    sale_price NUMERIC(12, 2),
    sale_date DATE,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_valuation_sources_valuation ON valuation_sources(valuation_id);

-- ============================================
-- Table: authenticity_checks
-- Purpose: AI authenticity scans
-- ============================================
CREATE TABLE authenticity_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    risk_score NUMERIC(3, 2) NOT NULL,
    confidence NUMERIC(3, 2),
    red_flags JSONB DEFAULT '[]'::jsonb,
    green_flags JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT,
    raw_output JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authenticity_checks_collectible ON authenticity_checks(collectible_id);
CREATE INDEX idx_authenticity_checks_risk ON authenticity_checks(risk_score);

-- ============================================
-- Table: sales_history
-- Purpose: User's buy/sell history
-- ============================================
CREATE TABLE sales_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collectible_id UUID NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'trade')),
    amount NUMERIC(12, 2),
    transaction_date DATE NOT NULL,
    platform TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_history_collectible ON sales_history(collectible_id);
CREATE INDEX idx_sales_history_user ON sales_history(user_id);
CREATE INDEX idx_sales_history_type ON sales_history(transaction_type);

-- ============================================
-- Table: user_collections
-- Purpose: Named collections/portfolios
-- ============================================
CREATE TABLE user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    total_items INTEGER DEFAULT 0,
    total_value NUMERIC(15, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_collections_owner ON user_collections(owner_user_id);
CREATE INDEX idx_user_collections_public ON user_collections(is_public) WHERE is_public = TRUE;

-- ============================================
-- Table: watchlists
-- Purpose: Items users are watching/wanting
-- ============================================
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    target_price NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_watchlists_user ON watchlists(user_id);
CREATE INDEX idx_watchlists_category ON watchlists(category_id);

-- ============================================
-- Table: spirits_products
-- Purpose: Spirits database integration
-- ============================================
CREATE TABLE spirits_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    distillery TEXT,
    spirit_type TEXT,
    age_statement INTEGER,
    abv NUMERIC(4, 2),
    region TEXT,
    awin_id TEXT UNIQUE,
    market_price NUMERIC(10, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spirits_products_name ON spirits_products(name);
CREATE INDEX idx_spirits_products_distillery ON spirits_products(distillery);
CREATE INDEX idx_spirits_products_awin ON spirits_products(awin_id);

-- ============================================
-- Table: spirits_metadata
-- Purpose: Extended spirits data
-- ============================================
CREATE TABLE spirits_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spirit_id UUID NOT NULL REFERENCES spirits_products(id) ON DELETE CASCADE,
    tasting_notes JSONB DEFAULT '{}'::jsonb,
    awards JSONB DEFAULT '[]'::jsonb,
    ratings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(spirit_id)
);

CREATE INDEX idx_spirits_metadata_spirit ON spirits_metadata(spirit_id);

-- ============================================
-- Functions
-- ============================================

CREATE TRIGGER collectibles_updated_at
    BEFORE UPDATE ON collectibles
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER user_collections_updated_at
    BEFORE UPDATE ON user_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

-- Get portfolio value
CREATE OR REPLACE FUNCTION get_portfolio_value(p_user_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(last_valuation), 0) INTO total
    FROM collectibles
    WHERE owner_user_id = p_user_id
    AND status = 'owned';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Get items by category
CREATE OR REPLACE FUNCTION get_collectibles_by_category(
    p_user_id TEXT,
    p_category_id TEXT
) RETURNS TABLE(
    id UUID,
    name TEXT,
    year INTEGER,
    condition TEXT,
    last_valuation NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.year,
        c.condition,
        c.last_valuation
    FROM collectibles c
    WHERE c.owner_user_id = p_user_id
    AND c.category_id = p_category_id
    AND c.status = 'owned'
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE collectibles IS 'Core collectibles inventory across all categories';
COMMENT ON TABLE collectible_attributes IS 'Category-specific attributes stored as JSONB';
COMMENT ON TABLE valuations IS 'AI-generated valuations with confidence scores';
COMMENT ON TABLE authenticity_checks IS 'AI authenticity scans with risk assessment';
COMMENT ON TABLE spirits_products IS 'Spirits database for enrichment workflow';
