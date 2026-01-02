-- ============================================
-- BRANCH MANAGEMENT CAPABILITIES
-- ============================================

-- Add audit trail for branch changes
CREATE TABLE IF NOT EXISTS branch_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    admin_id UUID REFERENCES admin_users(id),
    admin_name TEXT,
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add permissions table for granular control
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    permission TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, permission)
);

-- ============================================
-- PERMISSIONS FOR BRANCH MANAGEMENT
-- ============================================

-- Grant branch management permissions to upper management
INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'manage_branches' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'add_branch' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'delete_branch' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'edit_branch' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

-- Grant branch management permissions to branch managers for their own branch
INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'edit_own_branch' FROM admin_users WHERE role = 'branch_manager'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'manage_applicants' FROM admin_users WHERE role = 'branch_manager'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'create_test_sessions' FROM admin_users WHERE role = 'branch_manager'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'manage_questions' FROM admin_users WHERE role = 'branch_manager'
ON CONFLICT (admin_id, permission) DO NOTHING;

-- Grant permissions to upper management for all operations
INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'manage_applicants' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'create_test_sessions' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'manage_questions' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'view_all_results' FROM admin_users WHERE role = 'upper_management'
ON CONFLICT (admin_id, permission) DO NOTHING;

-- Grant view permissions to HR
INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'view_results' FROM admin_users WHERE role = 'hr'
ON CONFLICT (admin_id, permission) DO NOTHING;

INSERT INTO admin_permissions (admin_id, permission)
SELECT id, 'view_applicants' FROM admin_users WHERE role = 'hr'
ON CONFLICT (admin_id, permission) DO NOTHING;

-- ============================================
-- INDEXES FOR AUDIT LOG
-- ============================================

CREATE INDEX IF NOT EXISTS idx_branch_audit_branch ON branch_audit_log(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_audit_admin ON branch_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_branch_audit_action ON branch_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_branch_audit_date ON branch_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_perm ON admin_permissions(permission);

-- ============================================
-- FUNCTIONS FOR BRANCH MANAGEMENT
-- ============================================

-- Function to add a new branch
CREATE OR REPLACE FUNCTION add_branch(
    p_name TEXT,
    p_location TEXT,
    p_admin_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    branch_id UUID
) AS $$
DECLARE
    v_branch_id UUID;
    v_admin_name TEXT;
BEGIN
    -- Check if admin has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_permissions 
        WHERE admin_id = p_admin_id AND permission = 'add_branch'
    ) THEN
        RETURN QUERY SELECT false, 'Permission denied: add_branch', NULL::UUID;
        RETURN;
    END IF;
    
    -- Insert new branch
    INSERT INTO branches (name, location)
    VALUES (p_name, p_location)
    RETURNING id INTO v_branch_id;
    
    -- Get admin name
    SELECT full_name INTO v_admin_name FROM admin_users WHERE id = p_admin_id;
    
    -- Log the action
    INSERT INTO branch_audit_log (branch_id, action, admin_id, admin_name, new_values)
    VALUES (v_branch_id, 'CREATE', p_admin_id, v_admin_name, 
            jsonb_build_object('name', p_name, 'location', p_location));
    
    -- Create skill levels for new branch
    INSERT INTO branch_skill_levels (branch_id, level_number, level_name, min_score, max_score, passing_threshold)
    VALUES 
        (v_branch_id, 1, 'Level 1 - Junior Technician', 70, 79, 70),
        (v_branch_id, 2, 'Level 2 - Technician', 80, 89, 70),
        (v_branch_id, 3, 'Level 3 - Senior Technician', 90, 100, 70);
    
    -- Create email config for new branch
    INSERT INTO branch_email_config (branch_id, manager_email, hr_email)
    VALUES (v_branch_id, 'manager@generatorsource.com', 'hr@generatorsource.com');
    
    RETURN QUERY SELECT true, 'Branch added successfully', v_branch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a branch
CREATE OR REPLACE FUNCTION delete_branch(
    p_branch_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_admin_name TEXT;
    v_branch_name TEXT;
BEGIN
    -- Check if admin has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_permissions 
        WHERE admin_id = p_admin_id AND permission = 'delete_branch'
    ) THEN
        RETURN QUERY SELECT false, 'Permission denied: delete_branch';
        RETURN;
    END IF;
    
    -- Get branch and admin info
    SELECT full_name INTO v_admin_name FROM admin_users WHERE id = p_admin_id;
    SELECT name INTO v_branch_name FROM branches WHERE id = p_branch_id;
    
    -- Log the action before deletion
    INSERT INTO branch_audit_log (branch_id, action, admin_id, admin_name, old_values, reason)
    VALUES (p_branch_id, 'DELETE', p_admin_id, v_admin_name,
            jsonb_build_object('name', v_branch_name), p_reason);
    
    -- Delete the branch (cascade will handle related records)
    DELETE FROM branches WHERE id = p_branch_id;
    
    RETURN QUERY SELECT true, 'Branch deleted successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to update a branch
CREATE OR REPLACE FUNCTION update_branch(
    p_branch_id UUID,
    p_name TEXT,
    p_location TEXT,
    p_admin_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_admin_name TEXT;
    v_old_name TEXT;
    v_old_location TEXT;
BEGIN
    -- Check if admin has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_permissions 
        WHERE admin_id = p_admin_id AND permission = 'edit_branch'
    ) THEN
        RETURN QUERY SELECT false, 'Permission denied: edit_branch';
        RETURN;
    END IF;
    
    -- Get current values
    SELECT name, location INTO v_old_name, v_old_location FROM branches WHERE id = p_branch_id;
    
    -- Get admin name
    SELECT full_name INTO v_admin_name FROM admin_users WHERE id = p_admin_id;
    
    -- Update branch
    UPDATE branches SET name = p_name, location = p_location, updated_at = NOW()
    WHERE id = p_branch_id;
    
    -- Log the action
    INSERT INTO branch_audit_log (branch_id, action, admin_id, admin_name, old_values, new_values)
    VALUES (p_branch_id, 'UPDATE', p_admin_id, v_admin_name,
            jsonb_build_object('name', v_old_name, 'location', v_old_location),
            jsonb_build_object('name', p_name, 'location', p_location));
    
    RETURN QUERY SELECT true, 'Branch updated successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Branch management setup complete!' as status;
SELECT COUNT(*) as branch_audit_count FROM branch_audit_log;
SELECT COUNT(*) as permissions_count FROM admin_permissions;

-- Show permissions by role
SELECT au.full_name, au.role, STRING_AGG(ap.permission, ', ') as permissions
FROM admin_users au
LEFT JOIN admin_permissions ap ON au.id = ap.admin_id
GROUP BY au.id, au.full_name, au.role
ORDER BY au.role, au.full_name;
