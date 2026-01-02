-- Generator Technician Test - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Branches table (4 locations)
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch admins table (login credentials)
CREATE TABLE IF NOT EXISTS branch_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Email configuration per branch
CREATE TABLE IF NOT EXISTS branch_email_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE UNIQUE,
    manager_email TEXT NOT NULL,
    hr_email TEXT NOT NULL,
    cc_emails TEXT[], -- Additional CC emails
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES branch_admins(id)
);

-- Skill level configuration per branch
CREATE TABLE IF NOT EXISTS branch_skill_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    level_name TEXT NOT NULL,
    min_score INTEGER NOT NULL CHECK (min_score >= 0 AND min_score <= 100),
    max_score INTEGER NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
    passing_threshold INTEGER NOT NULL DEFAULT 70 CHECK (passing_threshold >= 0 AND passing_threshold <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, level_number),
    CHECK (min_score <= max_score)
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Technician information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Test details
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    skill_level TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    
    -- Test metadata
    time_taken_seconds INTEGER NOT NULL,
    pause_count INTEGER DEFAULT 0,
    
    -- Detailed answers (JSON)
    answers JSONB, -- Store all answers for review
    incorrect_answers JSONB, -- Store incorrect answers with explanations
    
    -- Certificate
    certificate_url TEXT, -- URL to stored certificate PDF
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'test_started', 'test_completed', 'admin_login', 'config_updated'
    user_email TEXT, -- For test takers
    admin_id UUID REFERENCES branch_admins(id), -- For admin actions
    details JSONB, -- Additional details about the activity
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_test_results_branch ON test_results(branch_id);
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_branch ON activity_log(branch_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow public access for now - will be refined with auth)
DROP POLICY IF EXISTS "Allow public read on branches" ON branches;
CREATE POLICY "Allow public read on branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on branches" ON branches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public on branch_email_config" ON branch_email_config;
CREATE POLICY "Allow public on branch_email_config" ON branch_email_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on branch_skill_levels" ON branch_skill_levels;
CREATE POLICY "Allow public on branch_skill_levels" ON branch_skill_levels FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on test_results" ON test_results;
CREATE POLICY "Allow public on test_results" ON test_results FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on activity_log" ON activity_log;
CREATE POLICY "Allow public on activity_log" ON activity_log FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on branch_admins" ON branch_admins;
CREATE POLICY "Allow public on branch_admins" ON branch_admins FOR ALL USING (true);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert 4 branch locations
INSERT INTO branches (name, location) VALUES
    ('Brighton', 'Brighton, CO'),
    ('Denver', 'Denver, CO'),
    ('Fort Collins', 'Fort Collins, CO'),
    ('Colorado Springs', 'Colorado Springs, CO')
ON CONFLICT (name) DO NOTHING;

-- Insert default skill levels for each branch (can be customized later)
WITH branch_ids AS (
    SELECT id, name FROM branches
)
INSERT INTO branch_skill_levels (branch_id, level_number, level_name, min_score, max_score, passing_threshold)
SELECT 
    id,
    level_data.level_number,
    level_data.level_name,
    level_data.min_score,
    level_data.max_score,
    70 as passing_threshold
FROM branch_ids
CROSS JOIN (
    VALUES 
        (1, 'Level 1 - Junior Technician', 70, 79),
        (2, 'Level 2 - Technician', 80, 89),
        (3, 'Level 3 - Senior Technician', 90, 100)
) AS level_data(level_number, level_name, min_score, max_score)
ON CONFLICT (branch_id, level_number) DO NOTHING;

-- Insert default email configuration for each branch
WITH branch_ids AS (
    SELECT id FROM branches
)
INSERT INTO branch_email_config (branch_id, manager_email, hr_email)
SELECT 
    id,
    'manager@generatorsource.com',
    'hr@generatorsource.com'
FROM branch_ids
ON CONFLICT (branch_id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check branches
SELECT 'Branches created:' as status, COUNT(*) as count FROM branches;
SELECT * FROM branches ORDER BY name;

-- Check skill levels
SELECT 'Skill levels created:' as status, COUNT(*) as count FROM branch_skill_levels;
SELECT b.name as branch, bsl.level_name, bsl.min_score, bsl.max_score 
FROM branch_skill_levels bsl
JOIN branches b ON b.id = bsl.branch_id
ORDER BY b.name, bsl.level_number;

-- Check email config
SELECT 'Email configs created:' as status, COUNT(*) as count FROM branch_email_config;
