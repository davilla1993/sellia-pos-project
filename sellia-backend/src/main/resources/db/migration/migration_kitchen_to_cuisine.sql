-- Migration script: Rename WorkStation KITCHEN to CUISINE
-- Date: 2025-10-30
-- Description: Update all existing KITCHEN references to CUISINE in the database

-- 1. Update products table
UPDATE products
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- 2. Update order_items table
UPDATE order_items
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- 3. Update tickets table
UPDATE tickets
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- Verification queries (optional - run these to check the migration)
-- SELECT work_station, COUNT(*) FROM products GROUP BY work_station;
-- SELECT work_station, COUNT(*) FROM order_items GROUP BY work_station;
-- SELECT work_station, COUNT(*) FROM tickets GROUP BY work_station;

-- Check if any KITCHEN references remain
-- SELECT 'products' as table_name, COUNT(*) as kitchen_count FROM products WHERE work_station = 'KITCHEN'
-- UNION ALL
-- SELECT 'order_items', COUNT(*) FROM order_items WHERE work_station = 'KITCHEN'
-- UNION ALL
-- SELECT 'tickets', COUNT(*) FROM tickets WHERE work_station = 'KITCHEN';
