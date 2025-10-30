-- Add BAR role to the database
-- Date: 2025-10-30
-- Description: Insert BAR role if it doesn't exist

-- Insert BAR role (using ID 4 if 1=ADMIN, 2=CAISSE, 3=CUISINE)
INSERT INTO roles (id, name, description, created_at, updated_at)
VALUES (4, 'BAR', 'Barman - Gestion des boissons et desserts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Verify the role was added
SELECT id, name, description FROM roles ORDER BY id;
