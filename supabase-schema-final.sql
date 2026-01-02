-- Generator Technician Test - Complete Supabase Database Schema
-- Includes question pool system with locked answer pattern
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BRANCHES & ADMIN
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
    cc_emails TEXT[],
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

-- ============================================
-- QUESTION POOL SYSTEM
-- ============================================

-- Question pool - organized by correct answer letter
CREATE TABLE IF NOT EXISTS question_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correct_answer_letter CHAR(1) NOT NULL CHECK (correct_answer_letter IN ('A', 'B', 'C', 'D')),
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES branch_admins(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active test configuration - defines which 100 questions are currently in use
CREATE TABLE IF NOT EXISTS active_test_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_position INTEGER NOT NULL CHECK (question_position >= 1 AND question_position <= 100) UNIQUE,
    question_id UUID REFERENCES question_pool(id) NOT NULL,
    correct_answer_letter CHAR(1) NOT NULL CHECK (correct_answer_letter IN ('A', 'B', 'C', 'D')),
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_by UUID REFERENCES branch_admins(id)
);

-- Shuffle history - track when questions were shuffled
CREATE TABLE IF NOT EXISTS shuffle_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shuffled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shuffled_by UUID REFERENCES branch_admins(id),
    questions_changed INTEGER,
    notes TEXT
);

-- ============================================
-- TEST RESULTS - MUST BE BEFORE QUESTION_FLAGS
-- ============================================

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    skill_level TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    pause_count INTEGER DEFAULT 0,
    answers JSONB,
    test_config_snapshot JSONB,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUESTION FLAGGING SYSTEM
-- ============================================

-- Question flags - when technicians report confusing questions
CREATE TABLE IF NOT EXISTS question_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES question_pool(id) ON DELETE CASCADE,
    test_result_id UUID REFERENCES test_results(id) ON DELETE SET NULL,
    technician_email TEXT NOT NULL,
    technician_name TEXT,
    flag_reason TEXT,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES branch_admins(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    resolution TEXT
);

-- ============================================
-- ACTIVITY LOG
-- ============================================

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    user_email TEXT,
    admin_id UUID REFERENCES branch_admins(id),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_question_pool_answer ON question_pool(correct_answer_letter);
CREATE INDEX IF NOT EXISTS idx_question_pool_active ON question_pool(is_active);
CREATE INDEX IF NOT EXISTS idx_question_pool_category ON question_pool(category);
CREATE INDEX IF NOT EXISTS idx_active_test_position ON active_test_config(question_position);
CREATE INDEX IF NOT EXISTS idx_test_results_branch ON test_results(branch_id);
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_branch ON activity_log(branch_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_question_flags_question ON question_flags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_flags_reviewed ON question_flags(is_reviewed);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_test_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuffle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public on branches" ON branches;
CREATE POLICY "Allow public on branches" ON branches FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on branch_admins" ON branch_admins;
CREATE POLICY "Allow public on branch_admins" ON branch_admins FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on branch_email_config" ON branch_email_config;
CREATE POLICY "Allow public on branch_email_config" ON branch_email_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on branch_skill_levels" ON branch_skill_levels;
CREATE POLICY "Allow public on branch_skill_levels" ON branch_skill_levels FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on question_pool" ON question_pool;
CREATE POLICY "Allow public on question_pool" ON question_pool FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on active_test_config" ON active_test_config;
CREATE POLICY "Allow public on active_test_config" ON active_test_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on shuffle_history" ON shuffle_history;
CREATE POLICY "Allow public on shuffle_history" ON shuffle_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on test_results" ON test_results;
CREATE POLICY "Allow public on test_results" ON test_results FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on activity_log" ON activity_log;
CREATE POLICY "Allow public on activity_log" ON activity_log FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public on question_flags" ON question_flags;
CREATE POLICY "Allow public on question_flags" ON question_flags FOR ALL USING (true);

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

-- Insert default skill levels for each branch
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
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current active test (100 questions in order)
CREATE OR REPLACE FUNCTION get_active_test()
RETURNS TABLE (
    question_position INTEGER,
    question_id UUID,
    category TEXT,
    question TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer_letter CHAR(1)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        atc.question_position,
        qp.id,
        qp.category,
        qp.question,
        qp.option_a,
        qp.option_b,
        qp.option_c,
        qp.option_d,
        atc.correct_answer_letter
    FROM active_test_config atc
    JOIN question_pool qp ON atc.question_id = qp.id
    ORDER BY atc.question_position;
END;
$$ LANGUAGE plpgsql;

-- Function to count available questions per answer letter
CREATE OR REPLACE FUNCTION count_questions_by_answer()
RETURNS TABLE (
    answer_letter CHAR(1),
    total_count BIGINT,
    active_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qp.correct_answer_letter,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE qp.is_active = true) as active_count
    FROM question_pool qp
    GROUP BY qp.correct_answer_letter
    ORDER BY qp.correct_answer_letter;
END;
$$ LANGUAGE plpgsql;

-- Function to get flagged questions summary
CREATE OR REPLACE FUNCTION get_flagged_questions_summary()
RETURNS TABLE (
    question_id UUID,
    question_text TEXT,
    correct_answer_letter CHAR(1),
    category TEXT,
    flag_count BIGINT,
    is_reviewed BOOLEAN,
    latest_flag_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qp.id,
        qp.question,
        qp.correct_answer_letter,
        qp.category,
        COUNT(qf.id) as flag_count,
        BOOL_OR(qf.is_reviewed) as is_reviewed,
        MAX(qf.flagged_at) as latest_flag_date
    FROM question_pool qp
    JOIN question_flags qf ON qp.id = qf.question_id
    GROUP BY qp.id, qp.question, qp.correct_answer_letter, qp.category
    ORDER BY flag_count DESC, latest_flag_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Setup complete!' as status;
SELECT 'Branches:' as info, COUNT(*) as count FROM branches;
SELECT 'Skill Levels:' as info, COUNT(*) as count FROM branch_skill_levels;
SELECT 'Email Configs:' as info, COUNT(*) as count FROM branch_email_config;
