-- Fix roles CHECK constraint and add BAR role
-- Date: 2025-10-30
-- Description: Update constraint to include BAR role, then insert it

-- 1. Drop old constraint on roles table
ALTER TABLE roles
DROP CONSTRAINT IF EXISTS roles_name_check;

-- 2. Create new constraint on roles table with ADMIN, CAISSE, CUISINE, and BAR
ALTER TABLE roles
ADD CONSTRAINT roles_name_check
CHECK (name IN ('ADMIN', 'CAISSE', 'CUISINE', 'BAR'));

-- 3. Insert BAR role (using ID 4 if 1=ADMIN, 2=CAISSE, 3=CUISINE)
INSERT INTO roles (id, name, description, created_at, updated_at, active)
VALUES (4, 'BAR', 'Barman - Gestion des boissons et desserts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true)
ON CONFLICT (name) DO NOTHING;

-- 4. Verify all roles
SELECT id, name, description, active FROM roles ORDER BY id;
