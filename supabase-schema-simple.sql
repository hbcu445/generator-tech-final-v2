-- PART 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PART 2: BRANCHES & ADMIN
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branch_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS branch_email_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE UNIQUE,
    manager_email TEXT NOT NULL,
    hr_email TEXT NOT NULL,
    cc_emails TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES branch_admins(id)
);

CREATE TABLE IF NOT EXISTS branch_skill_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    level_name TEXT NOT NULL,
    min_score INTEGER NOT NULL CHECK (min_score >= 0 AND min_score <= 100),
    max_score INTEGER NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
    passing_threshold INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, level_number)
);

-- PART 3: QUESTION POOL
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

CREATE TABLE IF NOT EXISTS active_test_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_position INTEGER NOT NULL CHECK (question_position >= 1 AND question_position <= 100) UNIQUE,
    question_id UUID REFERENCES question_pool(id) NOT NULL,
    correct_answer_letter CHAR(1) NOT NULL CHECK (correct_answer_letter IN ('A', 'B', 'C', 'D')),
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_by UUID REFERENCES branch_admins(id)
);

CREATE TABLE IF NOT EXISTS shuffle_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shuffled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shuffled_by UUID REFERENCES branch_admins(id),
    questions_changed INTEGER,
    notes TEXT
);

-- PART 4: TEST RESULTS (MUST BE BEFORE QUESTION_FLAGS)
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

-- PART 5: QUESTION FLAGGING (AFTER TEST_RESULTS)
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

-- PART 6: ACTIVITY LOG
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

-- PART 7: INDEXES
CREATE INDEX IF NOT EXISTS idx_question_pool_answer ON question_pool(correct_answer_letter);
CREATE INDEX IF NOT EXISTS idx_question_pool_active ON question_pool(is_active);
CREATE INDEX IF NOT EXISTS idx_question_pool_category ON question_pool(category);
CREATE INDEX IF NOT EXISTS idx_active_test_position ON active_test_config(question_position);
CREATE INDEX IF NOT EXISTS idx_test_results_branch ON test_results(branch_id);
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_branch ON activity_log(branch_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_question_flags_question ON question_flags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_flags_reviewed ON question_flags(is_reviewed);

-- PART 8: INITIAL DATA
INSERT INTO branches (name, location) VALUES
    ('Brighton', 'Brighton, CO'),
    ('Denver', 'Denver, CO'),
    ('Fort Collins', 'Fort Collins, CO'),
    ('Colorado Springs', 'Colorado Springs, CO')
ON CONFLICT (name) DO NOTHING;

INSERT INTO branch_skill_levels (branch_id, level_number, level_name, min_score, max_score, passing_threshold)
SELECT 
    b.id,
    levels.level_number,
    levels.level_name,
    levels.min_score,
    levels.max_score,
    70
FROM branches b
CROSS JOIN (
    VALUES 
        (1, 'Level 1 - Junior Technician', 70, 79),
        (2, 'Level 2 - Technician', 80, 89),
        (3, 'Level 3 - Senior Technician', 90, 100)
) AS levels(level_number, level_name, min_score, max_score)
ON CONFLICT (branch_id, level_number) DO NOTHING;

INSERT INTO branch_email_config (branch_id, manager_email, hr_email)
SELECT 
    id,
    'manager@generatorsource.com',
    'hr@generatorsource.com'
FROM branches
ON CONFLICT (branch_id) DO NOTHING;

-- VERIFICATION
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as branch_count FROM branches;
SELECT COUNT(*) as skill_level_count FROM branch_skill_levels;
SELECT COUNT(*) as email_config_count FROM branch_email_config;
