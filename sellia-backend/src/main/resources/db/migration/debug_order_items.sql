-- Debug: Vérifier les OrderItems de la dernière commande
-- Date: 2025-10-30

-- 1. Voir la dernière commande créée
SELECT
    o.id,
    o.public_id,
    o.order_number,
    o.status,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 1;

-- 2. Voir les OrderItems de cette commande avec leur workStation
SELECT
    oi.id,
    oi.public_id,
    oi.quantity,
    p.name as product_name,
    oi.work_station,
    oi.status as item_status,
    oi.ticket_id,
    o.order_number,
    o.status as order_status
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.id = (SELECT id FROM orders ORDER BY created_at DESC LIMIT 1)
ORDER BY oi.work_station;

-- 3. Voir les tickets générés pour cette commande
SELECT
    t.id,
    t.public_id,
    t.ticket_number,
    t.work_station,
    t.status,
    t.priority,
    t.message,
    COUNT(oi.id) as items_count
FROM tickets t
LEFT JOIN order_items oi ON oi.ticket_id = t.id
WHERE t.customer_session_id = (
    SELECT customer_session_id
    FROM orders
    ORDER BY created_at DESC
    LIMIT 1
)
GROUP BY t.id, t.public_id, t.ticket_number, t.work_station, t.status, t.priority, t.message
ORDER BY t.priority;

-- 4. Vérifier si les OrderItems sont bien liés aux tickets
SELECT
    t.ticket_number,
    t.work_station as ticket_station,
    oi.work_station as item_station,
    p.name as product_name,
    oi.quantity
FROM tickets t
JOIN order_items oi ON oi.ticket_id = t.id
JOIN products p ON oi.product_id = p.id
WHERE t.customer_session_id = (
    SELECT customer_session_id
    FROM orders
    ORDER BY created_at DESC
    LIMIT 1
)
ORDER BY t.work_station, p.name;
