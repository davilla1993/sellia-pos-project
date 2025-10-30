-- Fix remaining PASTRY and CHECKOUT data in database
-- Date: 2025-10-30
-- Description: Convert all PASTRY items to BAR and CHECKOUT to CUISINE

-- 1. Update products table - Convert PASTRY to BAR
UPDATE products
SET work_station = 'BAR'
WHERE work_station = 'PASTRY';

-- 2. Update products table - Convert CHECKOUT to CUISINE (if any)
UPDATE products
SET work_station = 'CUISINE'
WHERE work_station = 'CHECKOUT';

-- 3. Update order_items table - Convert PASTRY to BAR
UPDATE order_items
SET work_station = 'BAR'
WHERE work_station = 'PASTRY';

-- 4. Update order_items table - Convert CHECKOUT to CUISINE
UPDATE order_items
SET work_station = 'CUISINE'
WHERE work_station = 'CHECKOUT';

-- 5. Update tickets table - Convert PASTRY to BAR
UPDATE tickets
SET work_station = 'BAR'
WHERE work_station = 'PASTRY';

-- 6. Update tickets table - Convert CHECKOUT to CUISINE
UPDATE tickets
SET work_station = 'CUISINE'
WHERE work_station = 'CHECKOUT';

-- Verification: Check all work_station values
SELECT 'products' as table_name, work_station, COUNT(*) as count
FROM products
GROUP BY work_station
UNION ALL
SELECT 'order_items', work_station, COUNT(*)
FROM order_items
GROUP BY work_station
UNION ALL
SELECT 'tickets', work_station, COUNT(*)
FROM tickets
GROUP BY work_station
ORDER BY table_name, work_station;

-- Check if any invalid values remain
SELECT 'INVALID products' as issue, work_station, COUNT(*) as count
FROM products
WHERE work_station NOT IN ('CUISINE', 'BAR')
GROUP BY work_station
UNION ALL
SELECT 'INVALID order_items', work_station, COUNT(*)
FROM order_items
WHERE work_station NOT IN ('CUISINE', 'BAR')
GROUP BY work_station
UNION ALL
SELECT 'INVALID tickets', work_station, COUNT(*)
FROM tickets
WHERE work_station NOT IN ('CUISINE', 'BAR')
GROUP BY work_station;
