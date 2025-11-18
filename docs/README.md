# Sellia POS

Application de Point de Vente (POS) complète pour la gestion de restaurant.

## Description

Sellia POS est une solution moderne et complète pour gérer les opérations quotidiennes d'un restaurant :
- Prise de commandes
- Gestion des caisses multiples
- Système de tickets pour cuisine et bar
- Génération de factures et rapports
- Suivi des stocks

## Technologies

### Backend
- **Java 21** avec **Spring Boot 3.5.6**
- **PostgreSQL 16** - Base de données
- **JWT** - Authentification
- **iText7** - Génération PDF

### Frontend
- **Angular 20** avec **TypeScript**
- **TailwindCSS** - Styling
- **Chart.js / ApexCharts** - Graphiques

### DevOps
- **Docker** & **Docker Compose**
- **Coolify** - Déploiement cloud

## Fonctionnalités

- **Multi-caisses** : Plusieurs caisses simultanées avec sessions individuelles
- **Système de tickets** : Mode séparé (par station) ou unifié
- **Gestion des menus** : Menus, produits, catégories
- **Rapports PDF** : Rapports détaillés téléchargeables
- **Gestion des stocks** : Suivi et alertes
- **3 rôles** : Admin, Caissier, Cuisinier

## Installation rapide

### Prérequis

- Docker et Docker Compose
- OU
- Java 21, Node.js 20, PostgreSQL 16

### Avec Docker (recommandé)

```bash
# Cloner le projet
git clone <repo-url>
cd sellia-pos-project

# Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs

# Lancer les services
docker-compose up --build

# Accéder à l'application
# http://localhost:8080
```

### Sans Docker

```bash
# 1. Base de données PostgreSQL
createdb sellia_db

# 2. Backend
cd sellia-backend
mvn clean compile
mvn spring-boot:run

# 3. Frontend (nouveau terminal)
cd sellia-app
npm install
npm start

# Accéder à l'application
# Frontend: http://localhost:4200
# Backend: http://localhost:8080
```

## Configuration

Variables d'environnement principales :

```bash
# Base de données
DATABASE_URL=jdbc:postgresql://localhost:5432/sellia_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT (générer avec: openssl rand -base64 64)
JWT_SECRET=votre-secret-securise

# Application
APP_BASE_URL=http://localhost:8080
```

## Structure du projet

```
sellia-pos-project/
├── sellia-backend/      # API Spring Boot
├── sellia-app/          # Frontend Angular
├── docs/                # Documentation
├── monitoring/          # Configuration monitoring
├── Dockerfile           # Image Docker
└── docker-compose.yml   # Orchestration
```

## Documentation

- [Documentation Technique](./TECHNICAL-DOCUMENTATION.md) - Architecture, API, base de données
- [Guide Utilisateur](./USER-GUIDE.md) - Utilisation quotidienne
- [Guide de Déploiement](../DEPLOYMENT.md) - Déploiement en production
- [Configuration initiale](./SETUP.md) - Installation détaillée
- [Vue d'ensemble système](./SYSTEM-OVERVIEW.md) - Architecture complète

## Démarrage rapide

1. **Connexion admin** : Utilisez les identifiants par défaut ou créez un utilisateur
2. **Ouvrir la session globale** : Nécessaire avant toute opération
3. **Créer les caisses** : Configuration initiale
4. **Ajouter les produits** : Menu et catalogue

## API

Collection Postman disponible : `docs/Sellia_POS_API.postman_collection.json`

Endpoints principaux :
- `POST /api/auth/login` - Connexion
- `POST /api/global-sessions/open` - Ouvrir session
- `POST /api/orders` - Créer commande
- `GET /api/reports/global-session/{id}/pdf` - Rapport PDF

## Tests

```bash
# Backend
cd sellia-backend
mvn test

# Frontend
cd sellia-app
npm test
```

## Déploiement

### Docker Compose (développement/test)

```bash
docker-compose up -d
```

### Coolify (production)

Voir [DEPLOYMENT.md](../DEPLOYMENT.md) pour le guide complet.

Configuration requise :
- Build Pack: Docker
- Port: 8080
- Variables d'environnement configurées
- Volume persistant pour `/app/uploads`

## Sécurité

- Authentification JWT avec tokens expirables
- PIN à 4 chiffres pour les caisses (hashé bcrypt)
- Protection brute-force (3 tentatives = 15 min blocage)
- Auto-logout après 15 minutes d'inactivité
- HTTPS recommandé en production

## Support

- Consultez la documentation dans `/docs`
- Vérifiez les logs de l'application
- Health check : `GET /actuator/health`

## Licence

Propriétaire - Tous droits réservés

## Auteur

Folly Sitou - [contact]

---

**Version** : 0.0.1-SNAPSHOT
**Statut** : Production Ready
