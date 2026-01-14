-- Multi-AI Orchestrator - Phase G: Community Engine
-- Supabase Migration 003: Community, Neighborhoods, Projects
-- Created: 2026-01-13

-- ============================================
-- Table: communities
-- Purpose: Top-level community organization
-- ============================================
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communities_owner ON communities(owner_user_id);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);

-- ============================================
-- Table: community_members
-- Purpose: Community membership and roles
-- ============================================
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(role);

-- ============================================
-- Table: neighborhoods
-- Purpose: Sub-spaces within communities
-- ============================================
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_neighborhoods_community ON neighborhoods(community_id);
CREATE INDEX idx_neighborhoods_created_at ON neighborhoods(created_at DESC);

-- ============================================
-- Table: projects
-- Purpose: Projects within communities/neighborhoods
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_community ON projects(community_id);
CREATE INDEX idx_projects_neighborhood ON projects(neighborhood_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- Table: activity_log
-- Purpose: Community activity tracking
-- ============================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT, -- 'workflow', 'content', 'member', 'project', etc.
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_community ON activity_log(community_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================
-- Functions for Community Management
-- ============================================

-- Auto-update timestamp on update
CREATE OR REPLACE FUNCTION update_community_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER neighborhoods_updated_at
    BEFORE UPDATE ON neighborhoods
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_community_timestamp();

-- Get user role in community
CREATE OR REPLACE FUNCTION get_user_role(
    p_community_id UUID,
    p_user_id TEXT
) RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM community_members
    WHERE community_id = p_community_id
    AND user_id = p_user_id;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql;

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
    p_community_id UUID,
    p_user_id TEXT,
    p_required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy INT;
BEGIN
    user_role := get_user_role(p_community_id, p_user_id);
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Role hierarchy: owner > admin > member > guest
    CASE user_role
        WHEN 'owner' THEN role_hierarchy := 4;
        WHEN 'admin' THEN role_hierarchy := 3;
        WHEN 'member' THEN role_hierarchy := 2;
        WHEN 'guest' THEN role_hierarchy := 1;
        ELSE role_hierarchy := 0;
    END CASE;
    
    CASE p_required_role
        WHEN 'owner' THEN RETURN role_hierarchy >= 4;
        WHEN 'admin' THEN RETURN role_hierarchy >= 3;
        WHEN 'member' THEN RETURN role_hierarchy >= 2;
        WHEN 'guest' THEN RETURN role_hierarchy >= 1;
        ELSE RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Log community activity
CREATE OR REPLACE FUNCTION log_activity(
    p_community_id UUID,
    p_user_id TEXT,
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (
        community_id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        p_community_id,
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Get recent activity for community
CREATE OR REPLACE FUNCTION get_community_activity(
    p_community_id UUID,
    p_limit INT DEFAULT 50
) RETURNS TABLE(
    id UUID,
    user_id TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.metadata,
        a.created_at
    FROM activity_log a
    WHERE a.community_id = p_community_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

COMMENT ON TABLE communities IS 'Top-level community organization';
COMMENT ON TABLE community_members IS 'Community membership with role-based access';
COMMENT ON TABLE neighborhoods IS 'Sub-spaces within communities for organization';
COMMENT ON TABLE projects IS 'Projects within communities and neighborhoods';
COMMENT ON TABLE activity_log IS 'Complete activity tracking for communities';
