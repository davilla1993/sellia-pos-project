# Sellia POS API - Guide de Configuration

## Démarrage de l'Application

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

## Configuration de Base de Données

### Variables d'Environnement (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sellia_db
    username: postgres
    password: toor
```

**Assurez-vous que PostgreSQL est en cours d'exécution** avant de démarrer l'application.

## Premier Login

Une fois l'application démarrée:

1. **Importer la collection Postman**: `Sellia_POS_API.postman_collection.json`
2. **Login** avec credentials (à créer via endpoint ou directement en DB):
   - **Username**: `admin`
   - **Password**: `Admin123!@#` (respecte la politique de sécurité)

3. Les rôles sont maintenant disponibles pour l'assignation aux utilisateurs

## Politique de Sécurité des Mots de Passe

Tous les mots de passe doivent contenir:
- ✓ Minimum 6 caractères
- ✓ Au moins 1 lettre majuscule
- ✓ Au moins 1 chiffre
- ✓ Au moins 1 caractère spécial (`!@#$%^&*()_+-=[]{};':"\\|,.<>/?`)

Exemple valide: `Admin123!@#`

## Endpoints Phase 1, 2, 3

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

## Prochain Déploiement

Phase 3 (Orders & Workflow):
- OrderService
- WebSocket pour caisse ↔ cuisine
- QR Code generation
- Invoice management

