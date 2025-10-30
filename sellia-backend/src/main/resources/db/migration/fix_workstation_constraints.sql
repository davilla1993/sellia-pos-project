-- Fix WorkStation CHECK constraints
-- Date: 2025-10-30
-- Description: Drop old constraints and create new ones with CUISINE and BAR only

-- 1. Drop old constraint on products table
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_work_station_check;

-- 2. Create new constraint on products table with only CUISINE and BAR
ALTER TABLE products
ADD CONSTRAINT products_work_station_check
CHECK (work_station IN ('CUISINE', 'BAR'));

-- 3. Drop old constraint on order_items table
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_work_station_check;

-- 4. Create new constraint on order_items table
ALTER TABLE order_items
ADD CONSTRAINT order_items_work_station_check
CHECK (work_station IN ('CUISINE', 'BAR'));

-- 5. Drop old constraint on tickets table
ALTER TABLE tickets
DROP CONSTRAINT IF EXISTS tickets_work_station_check;

-- 6. Create new constraint on tickets table
ALTER TABLE tickets
ADD CONSTRAINT tickets_work_station_check
CHECK (work_station IN ('CUISINE', 'BAR'));

-- Now run the migration to update existing data
-- Update products table
UPDATE products
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- Update order_items table
UPDATE order_items
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- Update tickets table
UPDATE tickets
SET work_station = 'CUISINE'
WHERE work_station = 'KITCHEN';

-- Verification: Check if any KITCHEN references remain
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
GROUP BY work_station;
