-- Add order_type column to customer_sessions table
ALTER TABLE customer_sessions ADD COLUMN order_type VARCHAR(50) DEFAULT 'TABLE';

-- Add index on order_type for better query performance
CREATE INDEX idx_session_order_type ON customer_sessions(order_type);

-- Update existing sessions to TABLE (they were all table-based before)
UPDATE customer_sessions SET order_type = 'TABLE' WHERE order_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE customer_sessions MODIFY COLUMN order_type VARCHAR(50) NOT NULL;
