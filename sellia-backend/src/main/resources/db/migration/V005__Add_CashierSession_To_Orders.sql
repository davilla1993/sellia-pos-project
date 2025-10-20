-- Add cashier_session_id column to orders table
ALTER TABLE orders ADD COLUMN cashier_session_id BIGINT;

-- Add foreign key constraint
ALTER TABLE orders ADD CONSTRAINT fk_orders_cashier_session 
FOREIGN KEY (cashier_session_id) REFERENCES cashier_sessions(id);

-- Create index for better query performance
CREATE INDEX idx_orders_cashier_session ON orders(cashier_session_id);
