-- Insert default restaurant if none exists
INSERT INTO restaurants (id, public_id, name, description, address, phone_number, email, currency, tax_rate, timezone, default_language, is_active, qr_code_prefix, max_tables, allow_online_payment, allow_cash_payment, created_at, updated_at, created_by, updated_by, deleted)
SELECT 
    1,
    'rest-default-001',
    'Sellia Restaurant',
    'Your restaurant description',
    'Douala, Cameroon',
    '+237 XXX XXX XXX',
    'contact@sellia.com',
    'XAF',
    0.0,
    'Africa/Douala',
    'fr',
    true,
    'SELLIA',
    50,
    false,
    true,
    NOW(),
    NOW(),
    'system',
    'system',
    false
WHERE NOT EXISTS (SELECT 1 FROM restaurants);
