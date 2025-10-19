-- Make table_id nullable in orders table to support TAKEAWAY orders
ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;

-- Add order_type to orders table to track if it's a table or takeaway order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'TABLE';

-- Create index on order_type for better query performance
CREATE INDEX IF NOT EXISTS idx_order_order_type ON orders(order_type);

-- Update existing orders to TABLE (they were all table-based before)
UPDATE orders SET order_type = 'TABLE' WHERE order_type IS NULL;

-- Make the order_type column NOT NULL after setting defaults
ALTER TABLE orders ALTER COLUMN order_type SET NOT NULL;
