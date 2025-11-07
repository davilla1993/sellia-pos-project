# Sellia POS API - Guide de Configuration

## 1. Script SQL - Créer le Premier ADMIN

**Exécutez ce script SQL après le démarrage de l'application (une fois les tables créées et les rôles initialisés):**

```sql
-- Script pour créer le premier administrateur
-- Username: admin
-- Email: admin@sella.com
-- Password: Admin@123
-- 
-- Note: Le mot de passe est hashé avec BCrypt
-- Hash de "Admin@123": $2a$10$slYQmyNdGzin7olVv76p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2

INSERT INTO users (
    public_id,
    username,
    first_name,
    last_name,
    email,
    password,
    role_id,
    active,
    first_login,
    created_at,
    updated_at,
    created_by,
    deleted
) 
SELECT 
    gen_random_uuid(),
    'admin',
    'Adote Laurent',
    'AGBOSSOU',
    'admin@sella.com',
    '$2a$12$Zy1r0bJ05317oQ80VTodseXEp1SCG5fWl3WqJHUQ9siOp9O3aL84C',
    r.id,
    true,
    false,
    NOW(),
    NOW(),
    'SYSTEM',
    false
FROM roles r
WHERE r.name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);
```

**Après exécution du script:**
- Username: `admin`
- Email: `admin@sella.com`
- Password: `Admin@123`

Vous pouvez ensuite vous connecter avec ces identifiants.

---

## 2. Démarrage de l'Application

### Initialisation Automatique au Startup

Au démarrage de l'application, le service `DataInitializationService` **initialise automatiquement** les 3 rôles essentiels:

1. **ADMIN** - Maître absolu
   - Gère utilisateurs, rôles, menus, QR Codes
   - Gère les rapports et configuration générale
   - Réinitialise les mots de passe

2. **CAISSIER** - Gestion des ventes
   - Gère les commandes
   - Gère les encaissements
   - Gère les rapports de vente

3. **CUISINE** - Gestion des commandes en cuisine
   - Consulte les commandes
   - Met à jour le statut des commandes
   - Gère la préparation

### Logs de Démarrage

Lors du démarrage, vous verrez dans les logs:

```
Initializing default roles...
✓ ADMIN role created
✓ CAISSIER role created
✓ CUISINE role created
Default roles initialization completed
```

Ou si les rôles existent déjà:

```
Initializing default roles...
✓ ADMIN role already exists
✓ CAISSIER role already exists
✓ CUISINE role already exists
Default roles initialization completed
```

## 2.5 Configuration de Base de Données

### Variables d'Environnement (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sellia_db
    username: postgres
    password: toor
```

**Assurez-vous que PostgreSQL est en cours d'exécution** avant de démarrer l'application.

## 3. Premier Login

Une fois l'application démarrée et l'utilisateur ADMIN créé:

1. **Importer la collection Postman**: `Sellia_POS_API.postman_collection.json`
2. **Login** avec les credentials du script SQL:
   - **Username**: `admin`
   - **Password**: `Admin@123`

3. Copiez le `accessToken` et `refreshToken` dans les variables Postman
4. Les rôles sont maintenant disponibles pour l'assignation aux utilisateurs

## 4. Politique de Sécurité des Mots de Passe

Tous les mots de passe doivent contenir:
- ✓ Minimum 6 caractères
- ✓ Au moins 1 lettre majuscule
- ✓ Au moins 1 chiffre
- ✓ Au moins 1 caractère spécial (`!@#$%^&*()_+-=[]{};':"\\|,.<>/?`)

Exemple valide: `Admin123!@#`

## 5. Endpoints Phase 1, 2, 3

### Authentification
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Utilisateurs (ADMIN)
- `POST /api/users` - Créer utilisateur
- `GET /api/users` - Lister utilisateurs
- `GET /api/users/{publicId}` - Récupérer utilisateur
- `PUT /api/users/{publicId}` - Modifier utilisateur
- `POST /api/users/{publicId}/reset-password` - Réinitialiser mot de passe
- `POST /api/users/change-password` - Changer mot de passe

### Catégories
- `POST /api/categories` - Créer (ADMIN)
- `GET /api/categories` - Lister
- `GET /api/categories/active/list` - Catégories actives
- `GET /api/categories/ordered/list` - Catégories ordonnées
- `PUT /api/categories/{publicId}` - Modifier (ADMIN)
- `DELETE /api/categories/{publicId}` - Supprimer (ADMIN)

### Produits
- `POST /api/products` - Créer (ADMIN)
- `GET /api/products` - Lister
- `GET /api/products/available/list` - Produits disponibles
- `GET /api/products/category/{categoryId}` - Par catégorie
- `GET /api/products/search?name=xxx` - Chercher
- `GET /api/products/price-range?minPrice=xxx&maxPrice=xxx` - Gamme de prix
- `PUT /api/products/{publicId}` - Modifier (ADMIN)
- `DELETE /api/products/{publicId}` - Supprimer (ADMIN)

### Menus
- `POST /api/menus` - Créer (ADMIN)
- `GET /api/menus` - Lister
- `GET /api/menus/active/list` - Menus actifs
- `GET /api/menus/current/list` - Menus courants (valides maintenant)
- `GET /api/menus/type/{type}` - Par type (STANDARD, VIP, EXCEPTIONNEL, PROMOTIONNEL, PERSONNALISÉ)
- `GET /api/menus/type/{type}/active` - Menus actifs par type
- `POST /api/menus/{publicId}/activate` - Activer (ADMIN)
- `POST /api/menus/{publicId}/deactivate` - Désactiver (ADMIN)
- `DELETE /api/menus/{publicId}` - Supprimer (ADMIN)

### Tables
- `POST /api/tables` - Créer (ADMIN)
- `GET /api/tables` - Lister
- `GET /api/tables/active/list` - Tables actives
- `GET /api/tables/available/list` - Tables disponibles
- `GET /api/tables/room/{room}` - Par salle (Terrasse, VIP, Bar, etc.)
- `GET /api/tables/vip/list` - Tables VIP
- `GET /api/tables/capacity/{minCapacity}` - Par capacité min
- `GET /api/tables/stats/available-count` - Compter tables disponibles
- `GET /api/tables/stats/occupied-count` - Compter tables occupées
- `POST /api/tables/{publicId}/occupy?orderId=xxx` - Occuper (ADMIN/CAISSIER)
- `POST /api/tables/{publicId}/release` - Libérer (ADMIN/CAISSIER)
- `PUT /api/tables/{publicId}` - Modifier (ADMIN)
- `DELETE /api/tables/{publicId}` - Supprimer (ADMIN)

## 6. Upload d'Images pour Produits

Les produits supportent maintenant l'upload d'images lors de la création et de la mise à jour.

### Configuration
- Répertoire de stockage: `./uploads/products/`
- Taille max: 5MB par fichier
- Formats supportés: JPEG, PNG, GIF, WebP
- Les noms de fichiers sont auto-générés (UUID)

### Endpoints
- `POST /api/products` (multipart/form-data) - Créer avec image
- `PUT /api/products/{publicId}` (multipart/form-data) - Mettre à jour avec image
- `GET /api/products/images/{filename}` - Télécharger image
- `GET /api/products/{publicId}` - Voir produit + imageUrl
- `DELETE /api/products/{publicId}` - Supprimer (image auto-supprimée)

### Exemple Postman - Créer Produit avec Image
```
POST /api/products
Content-Type: multipart/form-data

Body (form-data):
- name: Croissant
- description: Croissant français
- price: 300
- stockQuantity: 50
- categoryId: 1
- image: [sélectionner fichier]
- preparationTime: 5
```

### Exemple cURL
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Croissant" \
  -F "price=300" \
  -F "stockQuantity=50" \
  -F "categoryId=1" \
  -F "image=@croissant.jpg"
```

Voir `IMAGE_UPLOAD.md` pour la documentation complète.

## 7. Prochain Déploiement

Phase 3 (Orders & Workflow):
- OrderService
- WebSocket pour caisse ↔ cuisine
- QR Code generation
- Invoice management



