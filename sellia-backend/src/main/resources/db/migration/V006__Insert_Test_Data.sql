-- Insert test data for analytics testing

-- Insert test global session (if not exists)
INSERT INTO global_sessions (id, public_id, date_opened, date_closed, status, total_sales, created_at, deleted)
SELECT 1, 'gs-test-001', CURRENT_DATE, NULL, 'OPEN', 0, NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM global_sessions WHERE public_id = 'gs-test-001');

-- Insert test users (caissiers)
INSERT INTO users (id, public_id, username, email, password, first_name, last_name, role_id, active, created_at, deleted)
VALUES 
  (1, 'user-001', 'caissier1', 'caissier1@test.com', '$2a$10$1234567890123456789012', 'Jean', 'Dupont', 2, true, NOW(), false),
  (2, 'user-002', 'caissier2', 'caissier2@test.com', '$2a$10$1234567890123456789012', 'Marie', 'Martin', 2, true, NOW(), false),
  (3, 'user-003', 'caissier3', 'caissier3@test.com', '$2a$10$1234567890123456789012', 'Pierre', 'Bernard', 2, true, NOW(), false)
ON CONFLICT (email) DO NOTHING;

-- Insert test cashiers
INSERT INTO cashiers (id, public_id, name, position, created_at, deleted)
VALUES 
  (1, 'cash-001', 'Caisse 1', 'Main Counter', NOW(), false),
  (2, 'cash-002', 'Caisse 2', 'Secondary Counter', NOW(), false),
  (3, 'cash-003', 'Caisse 3', 'Backup', NOW(), false)
ON CONFLICT (public_id) DO NOTHING;

-- Insert test cashier sessions
INSERT INTO cashier_sessions (id, public_id, cashier_id, user_id, global_session_id, opened_at, closed_at, status, created_at, deleted)
SELECT 1, 'cs-001', 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '8 hours', NULL, 'OPEN', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM cashier_sessions WHERE public_id = 'cs-001')
UNION ALL
SELECT 2, 'cs-002', 2, 2, 1, CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL, 'OPEN', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM cashier_sessions WHERE public_id = 'cs-002')
UNION ALL
SELECT 3, 'cs-003', 3, 3, 1, CURRENT_TIMESTAMP - INTERVAL '4 hours', NULL, 'OPEN', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM cashier_sessions WHERE public_id = 'cs-003');

-- Insert test products
INSERT INTO products (id, public_id, name, description, base_price, workstation_id, created_at, deleted)
VALUES
  (1, 'prod-001', 'Coca Cola', 'Soft drink', 500, 1, NOW(), false),
  (2, 'prod-002', 'Sprite', 'Soft drink', 500, 1, NOW(), false),
  (3, 'prod-003', 'Pizza', 'Main dish', 5000, 2, NOW(), false),
  (4, 'prod-004', 'Burger', 'Main dish', 4000, 2, NOW(), false),
  (5, 'prod-005', 'Tiramisu', 'Dessert', 2500, 3, NOW(), false)
ON CONFLICT (public_id) DO NOTHING;

-- Insert test menu items
INSERT INTO menu_items (id, public_id, name, description, price, workstation_id, created_at, deleted)
VALUES
  (1, 'mi-001', 'Coca Cola', 'Soft drink', 500, 1, NOW(), false),
  (2, 'mi-002', 'Sprite', 'Soft drink', 500, 1, NOW(), false),
  (3, 'mi-003', 'Pizza Margherita', 'Main dish', 5000, 2, NOW(), false),
  (4, 'mi-004', 'Burger Classique', 'Main dish', 4000, 2, NOW(), false),
  (5, 'mi-005', 'Tiramisu Maison', 'Dessert', 2500, 3, NOW(), false)
ON CONFLICT (public_id) DO NOTHING;

-- Insert test orders (distribute across date/time for analytics)
INSERT INTO orders (id, public_id, order_number, cashier_session_id, total_amount, discount_amount, is_paid, status, created_at, deleted)
VALUES
  -- Orders from cashier 1 (morning)
  (1, 'ord-001', 'ORD-001', 1, 10000, 500, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '8 hours' + INTERVAL '1 minute', false),
  (2, 'ord-002', 'ORD-002', 1, 15000, 0, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '8 hours' + INTERVAL '15 minutes', false),
  (3, 'ord-003', 'ORD-003', 1, 8000, 1000, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '7 hours' + INTERVAL '30 minutes', false),
  (4, 'ord-004', 'ORD-004', 1, 12000, 0, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '7 hours', false),
  
  -- Orders from cashier 2 (afternoon)
  (5, 'ord-005', 'ORD-005', 2, 20000, 2000, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '6 hours' + INTERVAL '10 minutes', false),
  (6, 'ord-006', 'ORD-006', 2, 18000, 0, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '6 hours' + INTERVAL '45 minutes', false),
  (7, 'ord-007', 'ORD-007', 2, 16000, 1600, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '5 hours' + INTERVAL '20 minutes', false),
  
  -- Orders from cashier 3 (recent)
  (8, 'ord-008', 'ORD-008', 3, 12000, 1200, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '4 hours' + INTERVAL '5 minutes', false),
  (9, 'ord-009', 'ORD-009', 3, 14000, 0, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '30 minutes', false),
  (10, 'ord-010', 'ORD-010', 3, 9000, 900, true, 'LIVREE', CURRENT_TIMESTAMP - INTERVAL '2 hours', false)
ON CONFLICT (public_id) DO NOTHING;

-- Insert test order items
INSERT INTO order_items (id, order_id, menu_item_id, product_id, quantity, unit_price, total_price, created_at)
VALUES
  (1, 1, 1, 1, 2, 500, 1000, NOW()),
  (2, 1, 3, 3, 1, 5000, 5000, NOW()),
  (3, 1, 5, 5, 1, 2500, 2500, NOW()),
  (4, 2, 2, 2, 3, 500, 1500, NOW()),
  (5, 2, 4, 4, 2, 4000, 8000, NOW()),
  (6, 3, 1, 1, 4, 500, 2000, NOW()),
  (7, 3, 3, 3, 1, 5000, 5000, NOW()),
  (8, 4, 5, 5, 2, 2500, 5000, NOW()),
  (9, 4, 2, 2, 2, 500, 1000, NOW()),
  (10, 5, 1, 1, 4, 500, 2000, NOW()),
  (11, 5, 4, 4, 3, 4000, 12000, NOW()),
  (12, 6, 3, 3, 2, 5000, 10000, NOW()),
  (13, 6, 5, 5, 1, 2500, 2500, NOW()),
  (14, 7, 2, 2, 5, 500, 2500, NOW()),
  (15, 7, 4, 4, 2, 4000, 8000, NOW()),
  (16, 8, 1, 1, 6, 500, 3000, NOW()),
  (17, 8, 3, 3, 1, 5000, 5000, NOW()),
  (18, 9, 5, 5, 2, 2500, 5000, NOW()),
  (19, 9, 2, 2, 4, 500, 2000, NOW()),
  (20, 10, 1, 1, 3, 500, 1500, NOW()),
  (21, 10, 4, 4, 1, 4000, 4000, NOW())
ON CONFLICT DO NOTHING;
