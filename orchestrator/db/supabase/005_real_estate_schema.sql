-- Multi-AI Orchestrator - Phase I: Real Estate Module
-- Supabase Migration 005: Complete Real Estate Schema
-- Created: 2026-01-13

-- ============================================
-- Table: properties
-- Purpose: Property listings (buy/sell/rent)
-- ============================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id TEXT NOT NULL,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('buy', 'sell', 'rent')),
    property_type TEXT NOT NULL CHECK (property_type IN ('house', 'condo', 'apartment', 'townhouse', 'commercial', 'land')),
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_state TEXT NOT NULL,
    address_zip TEXT NOT NULL,
    address_country TEXT DEFAULT 'USA',
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    price NUMERIC(12, 2) NOT NULL,
    bedrooms INTEGER,
    bathrooms NUMERIC(3, 1),
    sqft NUMERIC(10, 2),
    lot_size NUMERIC(10, 2),
    year_built INTEGER,
    description TEXT,
    ai_description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending', 'sold', 'rented', 'archived')),
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for property search
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_city_state ON properties(address_city, address_state);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_location ON properties USING gist(ll_to_earth(latitude, longitude));

-- ============================================
-- Table: property_analytics
-- Purpose: Market analysis and valuations
-- ============================================
CREATE TABLE property_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    market_value_estimate NUMERIC(12, 2),
    rental_estimate NUMERIC(10, 2),
    appreciation_rate NUMERIC(5, 2),
    comparable_properties JSONB DEFAULT '[]'::jsonb,
    neighborhood_score NUMERIC(3, 1),
    school_ratings JSONB DEFAULT '{}'::jsonb,
    crime_data JSONB DEFAULT '{}'::jsonb,
    walkability_score NUMERIC(3, 0),
    transit_score NUMERIC(3, 0),
    amenities JSONB DEFAULT '[]'::jsonb,
    market_trends JSONB DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(property_id)
);

CREATE INDEX idx_property_analytics_property ON property_analytics(property_id);
CREATE INDEX idx_property_analytics_generated ON property_analytics(generated_at DESC);

-- ============================================
-- Table: property_documents
-- Purpose: Legal documents and reports
-- ============================================
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'disclosure', 'inspection', 'appraisal', 'lease', 'offer', 'flyer')),
    document_name TEXT NOT NULL,
    generated_by TEXT NOT NULL CHECK (generated_by IN ('ai', 'user', 'upload')),
    file_url TEXT,
    file_path TEXT,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_documents_property ON property_documents(property_id);
CREATE INDEX idx_property_documents_type ON property_documents(document_type);
CREATE INDEX idx_property_documents_created ON property_documents(created_at DESC);

-- ============================================
-- Table: agents
-- Purpose: Real estate agent profiles
-- ============================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    license_number TEXT NOT NULL,
    license_state TEXT NOT NULL,
    specialization TEXT[] DEFAULT ARRAY['buyer', 'seller'],
    service_area JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_volume NUMERIC(15, 2) DEFAULT 0,
    bio TEXT,
    phone TEXT,
    email TEXT,
    languages TEXT[] DEFAULT ARRAY['English'],
    certifications TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_license_state ON agents(license_state);
CREATE INDEX idx_agents_specialization ON agents USING gin(specialization);
CREATE INDEX idx_agents_rating ON agents(rating DESC);
CREATE INDEX idx_agents_active ON agents(active) WHERE active = TRUE;

-- ============================================
-- Table: property_inquiries
-- Purpose: Lead tracking and communication
-- ============================================
CREATE TABLE property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    inquirer_user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    contact_preference TEXT DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'text')),
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'qualified', 'closed', 'spam')),
    response TEXT,
    responded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_inquiries_property ON property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_inquirer ON property_inquiries(inquirer_user_id);
CREATE INDEX idx_property_inquiries_agent ON property_inquiries(agent_id);
CREATE INDEX idx_property_inquiries_status ON property_inquiries(status);
CREATE INDEX idx_property_inquiries_created ON property_inquiries(created_at DESC);

-- ============================================
-- Table: property_tours
-- Purpose: Tour scheduling and tracking
-- ============================================
CREATE TABLE property_tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    tour_type TEXT NOT NULL DEFAULT 'virtual' CHECK (tour_type IN ('virtual', 'in_person', 'open_house')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    feedback TEXT,
    rating NUMERIC(1, 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_tours_property ON property_tours(property_id);
CREATE INDEX idx_property_tours_user ON property_tours(user_id);
CREATE INDEX idx_property_tours_agent ON property_tours(agent_id);
CREATE INDEX idx_property_tours_scheduled ON property_tours(scheduled_at);
CREATE INDEX idx_property_tours_status ON property_tours(status);

-- ============================================
-- Functions for Real Estate
-- ============================================

-- Auto-update timestamp
CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_property_views(p_property_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE properties
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql;

-- Search properties by criteria
CREATE OR REPLACE FUNCTION search_properties(
    p_listing_type TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_min_beds INTEGER DEFAULT NULL,
    p_min_baths NUMERIC DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
) RETURNS TABLE(
    id UUID,
    listing_type TEXT,
    property_type TEXT,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    price NUMERIC,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    sqft NUMERIC,
    images JSONB,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.listing_type,
        p.property_type,
        p.address_street,
        p.address_city,
        p.address_state,
        p.price,
        p.bedrooms,
        p.bathrooms,
        p.sqft,
        p.images,
        p.status
    FROM properties p
    WHERE (p_listing_type IS NULL OR p.listing_type = p_listing_type)
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
    AND (p_city IS NULL OR p.address_city ILIKE p_city)
    AND (p_state IS NULL OR p.address_state = p_state)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_min_beds IS NULL OR p.bedrooms >= p_min_beds)
    AND (p_min_baths IS NULL OR p.bathrooms >= p_min_baths)
    AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE properties IS 'Real estate property listings';
COMMENT ON TABLE property_analytics IS 'Market analysis and property valuations';
COMMENT ON TABLE property_documents IS 'Legal documents and reports';
COMMENT ON TABLE agents IS 'Real estate agent profiles';
COMMENT ON TABLE property_inquiries IS 'Property inquiry and lead tracking';
COMMENT ON TABLE property_tours IS 'Property tour scheduling';
