# Documentation Technique - Sellia POS

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies](#technologies)
4. [Structure du projet](#structure-du-projet)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Base de données](#base-de-données)
8. [API REST](#api-rest)
9. [Sécurité](#sécurité)
10. [Configuration](#configuration)
11. [Tests](#tests)
12. [Déploiement](#déploiement)

---

## Vue d'ensemble

Sellia POS est une application de Point de Vente (POS) complète conçue pour les restaurants. Elle permet la gestion des commandes, des caisses, des menus, des stocks et génère des rapports détaillés.

### Caractéristiques principales

- **Multi-caisses** : Gestion de plusieurs caisses simultanées avec sessions individuelles
- **Système de tickets** : Mode séparé (par station) ou unifié (ticket complet)
- **Gestion des menus** : Menus, produits, catégories avec assignation aux stations de travail
- **Rapports PDF** : Génération de rapports détaillés en PDF
- **Temps réel** : WebSocket pour les notifications et mises à jour
- **QR Codes** : Génération de QR codes pour les tables

---

## Architecture

### Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Navigateur)                     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │              Angular 20 (Frontend)                │     │
│    │  ├─ Features (admin, pos, customer, auth)        │     │
│    │  ├─ Services (API, Auth, State)                  │     │
│    │  └─ Components (UI réutilisables)                │     │
│    └──────────────────────────────────────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot (Backend)                     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │              API REST (Controllers)               │     │
│    │  ├─ Authentication & Authorization               │     │
│    │  ├─ Business Logic (Services)                    │     │
│    │  └─ Data Access (Repositories)                   │     │
│    └──────────────────────────────────────────────────┘     │
│                           │                                  │
│                           ▼                                  │
│    ┌──────────────────────────────────────────────────┐     │
│    │              JPA/Hibernate (ORM)                  │     │
│    └──────────────────────────────────────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Database)                     │
└─────────────────────────────────────────────────────────────┘
```

### Pattern architectural

- **Backend** : Architecture en couches (Controller → Service → Repository)
- **Frontend** : Architecture modulaire avec lazy loading
- **Communication** : REST API + WebSocket pour temps réel

---

## Technologies

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Java | 21 | Langage principal |
| Spring Boot | 3.5.6 | Framework backend |
| Spring Security | - | Authentification/Autorisation |
| Spring Data JPA | - | ORM et accès données |
| Spring WebSocket | - | Communication temps réel |
| PostgreSQL | 16 | Base de données |
| JWT (jjwt) | 0.12.3 | Tokens d'authentification |
| iText7 | 7.2.5 | Génération PDF |
| ZXing | 3.5.2 | Génération QR Code |
| Lombok | - | Réduction boilerplate |
| Maven | - | Build et dépendances |

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 20.1.0 | Framework frontend |
| TypeScript | 5.8.2 | Langage principal |
| TailwindCSS | 3.4.18 | Styling |
| RxJS | 7.8.0 | Programmation réactive |
| Chart.js | 4.5.1 | Graphiques |
| ApexCharts | 5.3.6 | Graphiques avancés |
| ngx-scanner | - | Scanner QR Code |

### DevOps

| Technologie | Usage |
|-------------|-------|
| Docker | Containerisation |
| Docker Compose | Orchestration locale |
| Coolify | Déploiement cloud |

---

## Structure du projet

```
sellia-pos-project/
├── sellia-backend/                 # Backend Spring Boot
│   ├── src/main/java/
│   │   └── com/follysitou/sellia_backend/
│   │       ├── config/             # Configuration Spring
│   │       ├── controller/         # Controllers REST (21)
│   │       ├── dto/                # Data Transfer Objects
│   │       │   ├── request/        # DTOs d'entrée
│   │       │   └── response/       # DTOs de sortie
│   │       ├── enums/              # Énumérations
│   │       ├── exception/          # Exceptions personnalisées
│   │       ├── model/              # Entités JPA (25)
│   │       ├── repository/         # Repositories JPA
│   │       ├── security/           # Configuration sécurité
│   │       └── service/            # Services métier
│   ├── src/main/resources/
│   │   └── application.properties  # Configuration
│   └── pom.xml                     # Dépendances Maven
│
├── sellia-app/                     # Frontend Angular
│   ├── src/app/
│   │   ├── core/                   # Services et guards
│   │   │   ├── guards/             # Route guards
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── services/           # Services partagés
│   │   ├── features/               # Modules fonctionnels
│   │   │   ├── admin/              # Module administration
│   │   │   ├── auth/               # Authentification
│   │   │   ├── customer/           # Interface client
│   │   │   ├── pos/                # Point de vente
│   │   │   ├── profile/            # Profil utilisateur
│   │   │   └── public/             # Pages publiques
│   │   └── shared/                 # Composants partagés
│   ├── src/environments/           # Configuration env
│   └── package.json                # Dépendances npm
│
├── docs/                           # Documentation
├── monitoring/                     # Configuration monitoring
├── Dockerfile                      # Image Docker
├── docker-compose.yml              # Orchestration
└── DEPLOYMENT.md                   # Guide déploiement
```

---

## Backend

### Entités (Models)

Le backend comprend 25 entités principales :

#### Authentification
- **User** : Utilisateurs du système
- **Role** : Rôles et permissions
- **ActiveToken** : Tokens JWT actifs

#### Gestion des sessions
- **GlobalSession** : Session journalière (ouverte par admin)
- **Cashier** : Caisse physique avec PIN
- **CashierSession** : Session d'un utilisateur sur une caisse

#### Catalogue
- **Category** : Catégories de produits
- **Product** : Produits avec WorkStation
- **Menu** : Menus groupés
- **MenuItem** : Articles dans un menu

#### Commandes
- **Order** : Commande client
- **OrderItem** : Ligne de commande
- **Ticket** : Ticket de préparation
- **CustomerSession** : Session client (table)

#### Établissement
- **Restaurant** : Configuration restaurant
- **RestaurantTable** : Tables du restaurant

#### Finance
- **Invoice** : Factures
- **Payment** : Paiements
- **CashOperation** : Opérations de caisse

#### Inventaire
- **Stock** : Niveaux de stock
- **InventoryMovement** : Mouvements de stock

#### Système
- **AuditLog** : Journal d'audit
- **Notification** : Notifications
- **Setting** : Paramètres

### Services

Les services principaux (27) :

| Service | Responsabilité |
|---------|----------------|
| AuthService | Authentification et JWT |
| UserService | Gestion des utilisateurs |
| GlobalSessionService | Sessions journalières |
| CashierService | Gestion des caisses |
| CashierSessionService | Sessions caissier |
| OrderService | Gestion des commandes |
| TicketService | Système de tickets |
| MenuService | Gestion des menus |
| ProductService | Gestion des produits |
| CategoryService | Gestion des catégories |
| StockService | Gestion des stocks |
| InvoiceService | Facturation |
| ReportService | Génération rapports JSON |
| PdfReportService | Génération rapports PDF |
| AnalyticsService | Statistiques et analytics |
| QrCodeService | Génération QR codes |
| NotificationService | Notifications WebSocket |
| FileService | Gestion fichiers/uploads |

### Controllers

21 controllers REST organisés par domaine :

```
/api/auth/*              - Authentification
/api/users/*             - Utilisateurs
/api/roles/*             - Rôles
/api/global-sessions/*   - Sessions globales
/api/cashiers/*          - Caisses
/api/cashier-sessions/*  - Sessions caissier
/api/orders/*            - Commandes
/api/tickets/*           - Tickets
/api/menus/*             - Menus
/api/menu-items/*        - Articles menu
/api/products/*          - Produits
/api/categories/*        - Catégories
/api/restaurants/*       - Restaurants
/api/tables/*            - Tables
/api/customer-sessions/* - Sessions client
/api/stocks/*            - Stocks
/api/cash-operations/*   - Opérations caisse
/api/reports/*           - Rapports
/api/analytics/*         - Analytics
/api/public/menu/*       - Menu public
```

---

## Frontend

### Modules fonctionnels

#### Module Admin (`/admin`)

Composants d'administration :

- **admin-dashboard** : Tableau de bord principal
- **users** : Gestion des utilisateurs
- **products** : Gestion des produits
- **categories** : Gestion des catégories
- **menus** : Gestion des menus
- **tables** : Gestion des tables
- **cashiers** : Gestion des caisses
- **global-session** : Session journalière
- **active-sessions** : Sessions actives
- **reports** : Rapports
- **analytics** : Statistiques
- **inventory** : Inventaire
- **cash-operations** : Opérations de caisse
- **stock-alerts** : Alertes stock
- **search-invoice** : Recherche factures
- **settings** : Paramètres

#### Module POS (`/pos`)

Interface point de vente :

- **order-entry** : Saisie des commandes
- **checkout** : Paiement
- **pending-orders** : Commandes en attente
- **my-orders** : Mes commandes
- **kitchen** : Vue cuisine
- **kitchen-kanban** : Kanban cuisine
- **bar** : Vue bar
- **bar-tickets** : Tickets bar
- **caisse-tickets** : Tickets caisse
- **cashier-selection** : Sélection caisse

#### Module Auth (`/auth`)

- **login** : Connexion
- **register** : Inscription

#### Module Customer (`/customer`)

- Interface client pour commande en ligne

### Services Core

```typescript
// Services principaux dans core/services/
├── api.service.ts          // Appels HTTP centralisés
├── auth.service.ts         // Authentification
├── order.service.ts        // Gestion commandes
├── product.service.ts      // Produits
├── menu.service.ts         // Menus
├── cashier.service.ts      // Caisses
├── global-session.service.ts
├── report.service.ts       // Rapports
├── notification.service.ts // Notifications
└── websocket.service.ts    // WebSocket
```

### Guards

```typescript
// Guards de route
├── auth.guard.ts           // Utilisateur connecté
├── role.guard.ts           // Vérification rôle
├── global-session.guard.ts // Session globale ouverte
└── cashier-session.guard.ts // Session caissier active
```

### Interceptors

```typescript
// HTTP Interceptors
├── auth.interceptor.ts     // Ajout token JWT
├── error.interceptor.ts    // Gestion erreurs
└── loading.interceptor.ts  // Indicateur chargement
```

---

## Base de données

### Schéma relationnel

```sql
-- Utilisateurs et rôles
users
├── id (PK)
├── public_id (UUID)
├── email (UNIQUE)
├── password_hash
├── first_name
├── last_name
├── role_id (FK → roles)
├── active
├── deleted
└── timestamps

roles
├── id (PK)
├── name (UNIQUE)
└── permissions (JSONB)

-- Sessions
global_sessions
├── id (PK)
├── public_id (UUID)
├── status (OPEN/CLOSED)
├── initial_amount
├── final_amount
├── opened_at
├── closed_at
├── opened_by (FK → users)
├── closed_by (FK → users)
└── deleted

cashiers
├── id (PK)
├── public_id (UUID)
├── name
├── number
├── pin_hash
├── status
├── failed_attempts
├── locked_until
└── deleted

cashier_sessions
├── id (PK)
├── public_id (UUID)
├── global_session_id (FK)
├── cashier_id (FK)
├── user_id (FK)
├── status (OPEN/LOCKED/CLOSED)
├── opened_at
├── closed_at
├── last_activity
└── deleted

-- Catalogue
categories
├── id (PK)
├── public_id (UUID)
├── name
├── description
├── display_order
└── deleted

products
├── id (PK)
├── public_id (UUID)
├── name
├── description
├── price
├── category_id (FK)
├── work_station (KITCHEN/BAR/PASTRY/CHECKOUT)
├── image_url
├── active
└── deleted

menus
├── id (PK)
├── public_id (UUID)
├── name
├── type (STANDARD/SPECIAL/SEASONAL)
├── active
└── deleted

menu_items
├── id (PK)
├── public_id (UUID)
├── menu_id (FK)
├── display_order
├── price_override
├── bundle_price
└── deleted

menu_item_products (Many-to-Many)
├── menu_item_id (FK)
└── product_id (FK)

-- Commandes
orders
├── id (PK)
├── public_id (UUID)
├── number
├── type (TABLE/TAKEAWAY/DELIVERY)
├── table_id (FK)
├── customer_session_id (FK)
├── cashier_session_id (FK)
├── status
├── total_amount
├── discount
├── notes
└── timestamps

order_items
├── id (PK)
├── public_id (UUID)
├── order_id (FK)
├── menu_item_id (FK)
├── product_id (FK)
├── quantity
├── unit_price
├── total_price
├── work_station
├── status
└── notes

tickets
├── id (PK)
├── public_id (UUID)
├── customer_session_id (FK)
├── work_station
├── status (PENDING/PRINTED/READY/SERVED)
├── priority
├── printed_at
├── ready_at
└── deleted
```

### Énumérations

```java
// WorkStation - Station de travail
KITCHEN, BAR, PASTRY, CHECKOUT

// OrderStatus - Statut commande
EN_ATTENTE, EN_PREPARATION, PRET, SERVI, ANNULE

// SessionStatus - Statut session
OPEN, LOCKED, CLOSED

// OrderType - Type de commande
TABLE, TAKEAWAY, DELIVERY

// PaymentMethod - Méthode paiement
CASH, CARD, MOBILE_MONEY

// TicketStatus - Statut ticket
PENDING, PRINTED, READY, SERVED
```

---

## API REST

### Authentification

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "publicId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN"
  }
}
```

### Sessions globales

```http
# Ouvrir une session (Admin)
POST /api/global-sessions/open
Authorization: Bearer {token}

{
  "initialAmount": 5000
}

# Obtenir la session courante
GET /api/global-sessions/current

# Fermer la session
POST /api/global-sessions/{id}/close
{
  "finalAmount": 15000,
  "notes": "Journée normale"
}
```

### Caisses

```http
# Créer une caisse
POST /api/cashiers
{
  "name": "Caisse 1",
  "number": "C01",
  "pin": "1234"
}

# Ouvrir une session caissier
POST /api/cashier-sessions/open
{
  "cashierPublicId": "uuid",
  "pin": "1234"
}

# Fermer une session caissier
POST /api/cashier-sessions/{id}/close
{
  "notes": "Fin de service"
}
```

### Commandes

```http
# Créer une commande
POST /api/orders
{
  "tablePublicId": "uuid",
  "items": [
    {
      "menuItemPublicId": "uuid",
      "quantity": 2,
      "notes": "Sans oignon"
    }
  ]
}

# Mettre à jour le statut
PUT /api/orders/{id}/status/{status}

# Appliquer une remise
PUT /api/orders/{id}/discount
{
  "discount": 500,
  "reason": "Client fidèle"
}
```

### Tickets

```http
# Générer des tickets séparés (par station)
POST /api/tickets/session/{customerSessionId}/generate/separated

# Générer un ticket unifié (complet)
POST /api/tickets/session/{customerSessionId}/generate/unified

# Obtenir les tickets d'une station
GET /api/tickets/station/BAR/active

# Marquer comme prêt
PUT /api/tickets/{id}/ready
```

### Rapports

```http
# Rapport JSON de session globale
GET /api/reports/global-session/{id}

# Rapport PDF d'un caissier
GET /api/reports/cashier/{id}/pdf?startDate=2024-01-01&endDate=2024-01-31

# Rapport par utilisateur
GET /api/reports/user/{id}?startDate=2024-01-01&endDate=2024-01-31
```

---

## Sécurité

### Authentification JWT

- **Access Token** : Durée 1 heure (configurable)
- **Refresh Token** : Durée 5 jours (configurable)
- Algorithme : HS256
- Secret : Variable d'environnement `JWT_SECRET`

### Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| ADMIN | Toutes les permissions |
| CAISSIER | Commandes, session caissier, rapports propres |
| CUISINIER | Vue cuisine uniquement |

### Protection des caisses

- PIN à 4 chiffres hashé avec bcrypt
- 3 tentatives max avant verrouillage (15 min)
- Déverrouillage automatique après délai ou avec bon PIN

### Session management

- Inactivité : Auto-logout après 15 minutes
- Session globale requise pour opérations caissier
- Tracking d'activité toutes les 30 secondes

### Protections

- **XSS** : Sanitization des inputs
- **SQL Injection** : Prepared statements (JPA)
- **CSRF** : Token validation
- **Brute-force** : Verrouillage après tentatives

---

## Configuration

### Variables d'environnement

```bash
# Base de données
DATABASE_URL=jdbc:postgresql://localhost:5432/sellia_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Hibernate
HIBERNATE_DDL_AUTO=update  # dev: update, prod: validate

# Application
APP_SERVER_URL=http://localhost:8080
APP_BASE_URL=http://localhost:8080
BACKEND_PORT=8080

# JWT
JWT_SECRET=votre-secret-256-bits-minimum
JWT_ACCESS_TOKEN_EXPIRATION=3600000    # 1 heure
JWT_REFRESH_TOKEN_EXPIRATION=432000000 # 5 jours

# Java
JAVA_OPTS=-Xms512m -Xmx1024m
```

### Configuration Spring Boot

```properties
# application.properties

# Datasource
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=${HIBERNATE_DDL_AUTO:update}
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server
server.port=${BACKEND_PORT:8080}

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
```

### Configuration Angular

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

---

## Tests

### Tests Backend

```bash
# Exécuter tous les tests
cd sellia-backend
mvn test

# Tests avec couverture
mvn test jacoco:report

# Tests d'intégration
mvn verify -P integration-tests
```

### Tests Frontend

```bash
# Tests unitaires
cd sellia-app
npm test

# Tests avec couverture
npm test -- --code-coverage

# Tests e2e
npm run e2e
```

### Collection Postman

Une collection Postman complète est disponible dans :
```
docs/Sellia_POS_API.postman_collection.json
```

---

## Déploiement

### Docker (Développement)

```bash
# Build et lancement
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Arrêt
docker-compose down
```

### Production (Coolify)

1. **Prérequis**
   - VPS avec Coolify installé
   - Service PostgreSQL Coolify

2. **Configuration**
   - Build Pack : Docker
   - Dockerfile : `./Dockerfile`
   - Port : 8080

3. **Variables d'environnement**
   - Configurer toutes les variables listées ci-dessus
   - Générer un `JWT_SECRET` sécurisé

4. **Volumes**
   - `/app/uploads` : Fichiers uploadés

5. **SSL/TLS**
   - Activer Let's Encrypt sur Coolify

### Dockerfile

```dockerfile
# Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY sellia-app/package*.json ./
RUN npm ci
COPY sellia-app/ ./
RUN npm run build

# Build Backend
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY sellia-backend/pom.xml ./
RUN mvn dependency:go-offline
COPY sellia-backend/src ./src
COPY --from=frontend-build /app/frontend/dist/sellia-app/browser ./src/main/resources/static
RUN mvn clean package -DskipTests

# Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Monitoring

### Health Check

```http
GET /actuator/health

Response:
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### Métriques

```http
GET /actuator/metrics
GET /actuator/metrics/jvm.memory.used
GET /actuator/metrics/http.server.requests
```

---

## Annexes

### Workflow journalier type

1. **Ouverture (Admin)**
   - Login admin
   - Ouvrir session globale avec montant initial
   - Vérifier les caisses disponibles

2. **Service (Caissiers)**
   - Login caissier
   - Ouvrir session sur caisse (PIN)
   - Prendre les commandes
   - Générer tickets
   - Encaisser

3. **Cuisine/Bar**
   - Consulter tickets de station
   - Préparer commandes
   - Marquer prêt

4. **Fermeture (Admin)**
   - Consulter rapports
   - Réconcilier montants
   - Fermer session globale

### Codes de réponse API

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 409 | Conflit |
| 500 | Erreur serveur |

---

## Contact

Pour toute question technique, consulter :
- `docs/SYSTEM-OVERVIEW.md` : Vue d'ensemble système
- `docs/SETUP.md` : Guide d'installation
- `DEPLOYMENT.md` : Guide de déploiement
