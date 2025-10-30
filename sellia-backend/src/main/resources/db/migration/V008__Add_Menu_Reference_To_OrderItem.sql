-- Add menu_id column to order_items table to reference the full menu
ALTER TABLE order_items ADD COLUMN menu_id BIGINT;

-- Add foreign key constraint
ALTER TABLE order_items ADD CONSTRAINT fk_order_item_menu
    FOREIGN KEY (menu_id) REFERENCES menus(id);

-- Add index for better query performance
CREATE INDEX idx_order_item_menu ON order_items(menu_id);
