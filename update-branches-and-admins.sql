-- ============================================
-- UPDATE BRANCHES TO CORRECT LOCATIONS
-- ============================================

-- Update existing branches
UPDATE branches SET name = 'Brighton', location = 'Brighton, CO' WHERE location LIKE '%Brighton%' OR location LIKE '%Denver%';
UPDATE branches SET name = 'Jacksonville', location = 'Jacksonville, FL' WHERE location LIKE '%Denver%' OR location LIKE '%Fort Collins%';
UPDATE branches SET name = 'Austin', location = 'Austin, TX' WHERE location LIKE '%Fort Collins%' OR location LIKE '%Colorado Springs%';
UPDATE branches SET name = 'Pensacola', location = 'Pensacola, FL' WHERE location LIKE '%Colorado Springs%';

-- Alternative: Delete and recreate
DELETE FROM branches;

INSERT INTO branches (name, location) VALUES
    ('Brighton', 'Brighton, CO'),
    ('Jacksonville', 'Jacksonville, FL'),
    ('Austin', 'Austin, TX'),
    ('Pensacola', 'Pensacola, FL');

-- ============================================
-- UPDATE ADMIN USERS
-- ============================================

-- Delete existing admin users
DELETE FROM admin_users;

-- Insert updated admin users with correct branch assignments
-- Brighton Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'brighton_manager', 'HASH_PLACEHOLDER_1', 'brighton.manager@generatorsource.com', 'Brighton Manager', 'branch_manager'
FROM branches WHERE name = 'Brighton';

-- Jacksonville Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'jacksonville_manager', 'HASH_PLACEHOLDER_2', 'jacksonville.manager@generatorsource.com', 'Jacksonville Manager', 'branch_manager'
FROM branches WHERE name = 'Jacksonville';

-- Austin Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'austin_manager', 'HASH_PLACEHOLDER_3', 'austin.manager@generatorsource.com', 'Austin Manager', 'branch_manager'
FROM branches WHERE name = 'Austin';

-- Pensacola Manager
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
SELECT id, 'pensacola_manager', 'HASH_PLACEHOLDER_4', 'pensacola.manager@generatorsource.com', 'Pensacola Manager', 'branch_manager'
FROM branches WHERE name = 'Pensacola';

-- Director of National Sales (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'director_national_sales', 'HASH_PLACEHOLDER_5', 'director.sales@generatorsource.com', 'Director of National Sales', 'upper_management');

-- CEO (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'ceo', 'HASH_PLACEHOLDER_6', 'ceo@generatorsource.com', 'CEO', 'upper_management');

-- HR Manager (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'hr_manager', 'HASH_PLACEHOLDER_7', 'hr.manager@generatorsource.com', 'HR Manager', 'hr');

-- Accounting Manager (access all branches)
INSERT INTO admin_users (branch_id, username, password_hash, email, full_name, role)
VALUES (NULL, 'accounting_manager', 'HASH_PLACEHOLDER_8', 'accounting.manager@generatorsource.com', 'Accounting Manager', 'hr');

-- ============================================
-- UPDATE BRANCH EMAIL CONFIGS
-- ============================================

DELETE FROM branch_email_config;

INSERT INTO branch_email_config (branch_id, manager_email, hr_email)
SELECT id, 'brighton.manager@generatorsource.com', 'hr.manager@generatorsource.com' FROM branches WHERE name = 'Brighton'
UNION ALL
SELECT id, 'jacksonville.manager@generatorsource.com', 'hr.manager@generatorsource.com' FROM branches WHERE name = 'Jacksonville'
UNION ALL
SELECT id, 'austin.manager@generatorsource.com', 'hr.manager@generatorsource.com' FROM branches WHERE name = 'Austin'
UNION ALL
SELECT id, 'pensacola.manager@generatorsource.com', 'hr.manager@generatorsource.com' FROM branches WHERE name = 'Pensacola';

-- ============================================
-- UPDATE BRANCH SKILL LEVELS
-- ============================================

DELETE FROM branch_skill_levels;

INSERT INTO branch_skill_levels (branch_id, level_number, level_name, min_score, max_score, passing_threshold)
SELECT b.id, levels.level_number, levels.level_name, levels.min_score, levels.max_score, 70
FROM branches b
CROSS JOIN (
    VALUES 
        (1, 'Level 1 - Junior Technician', 70, 79),
        (2, 'Level 2 - Technician', 80, 89),
        (3, 'Level 3 - Senior Technician', 90, 100)
) AS levels(level_number, level_name, min_score, max_score);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Branches and admins updated!' as status;
SELECT COUNT(*) as branch_count FROM branches;
SELECT COUNT(*) as admin_users_count FROM admin_users;
SELECT COUNT(*) as skill_level_count FROM branch_skill_levels;

-- Show all admin users
SELECT username, full_name, role, b.name as branch FROM admin_users au
LEFT JOIN branches b ON au.branch_id = b.id
ORDER BY role, full_name;
