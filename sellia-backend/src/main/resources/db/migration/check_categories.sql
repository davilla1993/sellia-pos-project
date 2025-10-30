-- Script pour vérifier les catégories actuelles
-- Exécuter dans PostgreSQL pour voir l'état actuel

-- 1. Voir toutes les catégories avec le nombre de produits
SELECT
    c.id,
    c.name,
    c.description,
    c.available,
    c.display_order,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.deleted = false
WHERE c.deleted = false
GROUP BY c.id, c.name, c.description, c.available, c.display_order
ORDER BY c.display_order, c.name;

-- 2. Voir les produits par catégorie
SELECT
    c.name as category_name,
    p.name as product_name,
    p.price,
    p.available
FROM categories c
JOIN products p ON p.category_id = c.id
WHERE c.deleted = false AND p.deleted = false
ORDER BY c.name, p.name;
