-- ============================================
-- ADMIN USERS & ROLES
-- ============================================

-- Admin roles enum
CREATE TYPE admin_role AS ENUM ('branch_manager', 'upper_management', 'hr');

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role admin_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- APPLICANTS
-- ============================================

-- Applicants table
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, email)
);

-- ============================================
-- TEST SESSIONS & LINKS
-- ============================================

-- Test mode enum
CREATE TYPE test_mode AS ENUM ('on_site', 'remote');

-- Test sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
    test_link_token TEXT NOT NULL UNIQUE,
    test_mode test_mode NOT NULL,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    test_result_id UUID REFERENCES test_results(id) ON DELETE SET NULL,
    is_used BOOLEAN DEFAULT false,
    notes TEXT
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admin_users_branch ON admin_users(branch_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_applicants_branch ON applicants(branch_id);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_test_sessions_applicant ON test_sessions(applicant_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_branch ON test_sessions(branch_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_token ON test_sessions(test_link_token);
CREATE INDEX IF NOT EXISTS idx_test_sessions_expires ON test_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_test_sessions_used ON test_sessions(is_used);

-- ============================================
-- INITIAL ADMIN USERS
-- ============================================

-- Get branch IDs
-- Brighton Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'brighton_manager', 'HASH_PLACEHOLDER_1', 'brighton.manager@generatorsource.com', 'Brighton Manager', 'branch_manager'
FROM branches WHERE name = 'Brighton'
ON CONFLICT (username) DO NOTHING;

-- Denver Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'denver_manager', 'HASH_PLACEHOLDER_2', 'denver.manager@generatorsource.com', 'Denver Manager', 'branch_manager'
FROM branches WHERE name = 'Denver'
ON CONFLICT (username) DO NOTHING;

-- Fort Collins Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'fortcollins_manager', 'HASH_PLACEHOLDER_3', 'fortcollins.manager@generatorsource.com', 'Fort Collins Manager', 'branch_manager'
FROM branches WHERE name = 'Fort Collins'
ON CONFLICT (username) DO NOTHING;

-- Colorado Springs Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'coloradosprings_manager', 'HASH_PLACEHOLDER_4', 'coloradosprings.manager@generatorsource.com', 'Colorado Springs Manager', 'branch_manager'
FROM branches WHERE name = 'Colorado Springs'
ON CONFLICT (username) DO NOTHING;

-- Upper Management 1 (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'upper_management_1', 'HASH_PLACEHOLDER_5', 'upper.management1@generatorsource.com', 'Upper Management 1', 'upper_management')
ON CONFLICT (username) DO NOTHING;

-- Upper Management 2 (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'upper_management_2', 'HASH_PLACEHOLDER_6', 'upper.management2@generatorsource.com', 'Upper Management 2', 'upper_management')
ON CONFLICT (username) DO NOTHING;

-- HR 1 (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'hr_1', 'HASH_PLACEHOLDER_7', 'hr1@generatorsource.com', 'HR 1', 'hr')
ON CONFLICT (username) DO NOTHING;

-- HR 2 (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'hr_2', 'HASH_PLACEHOLDER_8', 'hr2@generatorsource.com', 'HR 2', 'hr')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Admin schema setup complete!' as status;
SELECT COUNT(*) as admin_users_count FROM admin_users;
SELECT COUNT(*) as applicants_count FROM applicants;
SELECT COUNT(*) as test_sessions_count FROM test_sessions;
