-- Migration script: Changer le rôle CAISSIER en CAISSE dans la base de données
-- Date: 2025-10-17

-- Supprimer la contrainte CHECK qui empêche la mise à jour
ALTER TABLE roles DROP CONSTRAINT roles_name_check;

-- Mettre à jour la table roles: changer le nom du rôle CAISSIER en CAISSE
UPDATE roles SET name = 'CAISSE' WHERE name = 'CAISSIER';

-- Recréer la contrainte CHECK avec les nouvelles valeurs
ALTER TABLE roles ADD CONSTRAINT roles_name_check CHECK (name IN ('ADMIN', 'CAISSE', 'CUISINE'));

-- Log de confirmation
SELECT COUNT(*) as roles_updated FROM roles WHERE name = 'CAISSE';
