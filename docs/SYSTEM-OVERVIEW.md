# SELLIA POS - Vue d'Ensemble Complète du Système

---

## Table des matières

1. [Architecture Système](#1-architecture-système)
2. [Stack Technologique](#2-stack-technologique)
3. [Fonctionnalités Principales](#3-fonctionnalités-principales)
4. [Modèle de Données](#4-modèle-de-données)
5. [API REST Complète](#5-api-rest-complète)
6. [Workflows Métier](#6-workflows-métier)
7. [Sécurité](#7-sécurité)
8. [Configuration](#8-configuration)
9. [Monitoring](#9-monitoring)
10. [Déploiement](#10-déploiement)
11. [Tests](#11-tests)

---

## 1. Architecture Système

### 1.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SELLIA POS PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────┐         ┌─────────────────────────┐        │
│  │   FRONTEND (Angular 20) │         │  BACKEND (Spring Boot)  │        │
│  ├─────────────────────────┤         ├─────────────────────────┤        │
│  │                         │         │                         │        │
│  │  ┌─────────────────┐    │  HTTP   │  ┌─────────────────┐    │        │
│  │  │ Admin Module    │    │ ──────► │  │ Controllers     │    │        │
│  │  │ • Dashboard     │    │  REST   │  │ • 21 endpoints  │    │        │
│  │  │ • Users/Roles   │    │         │  │ • Validation    │    │        │
│  │  │ • Products      │    │         │  └────────┬────────┘    │        │
│  │  │ • Reports       │    │         │           │             │        │
│  │  └─────────────────┘    │         │  ┌────────▼────────┐    │        │
│  │                         │         │  │ Services        │    │        │
│  │  ┌─────────────────┐    │         │  │ • Business Logic│    │        │
│  │  │ POS Module      │    │         │  │ • 27 services   │    │        │
│  │  │ • Order Entry   │    │ ◄────── │  └────────┬────────┘    │        │
│  │  │ • Checkout      │    │  JSON   │           │             │        │
│  │  │ • Kitchen/Bar   │    │         │  ┌────────▼────────┐    │        │
│  │  └─────────────────┘    │         │  │ Repositories    │    │        │
│  │                         │         │  │ • JPA/Hibernate │    │        │
│  │  ┌─────────────────┐    │         │  └────────┬────────┘    │        │
│  │  │ Auth Module     │    │         │           │             │        │
│  │  │ • Login/Logout  │    │         └───────────┼─────────────┘        │
│  │  │ • PIN Entry     │    │                     │                      │
│  │  └─────────────────┘    │                     │ JDBC                 │
│  │                         │                     │                      │
│  └─────────────────────────┘                     ▼                      │
│                                      ┌─────────────────────────┐        │
│                                      │  PostgreSQL Database    │        │
│                                      │  • 25 tables            │        │
│                                      │  • Soft delete          │        │
│                                      │  • Audit logging        │        │
│                                      └─────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture en couches (Backend)

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│  Controllers (REST API Endpoints)       │
│  • Request validation                   │
│  • Response formatting                  │
│  • Exception handling                   │
├─────────────────────────────────────────┤
│           BUSINESS LAYER                │
│  Services (Business Logic)              │
│  • Transaction management               │
│  • Business rules                       │
│  • Data transformation                  │
├─────────────────────────────────────────┤
│           PERSISTENCE LAYER             │
│  Repositories (Data Access)             │
│  • JPA repositories                     │
│  • Custom queries                       │
│  • Pagination support                   │
├─────────────────────────────────────────┤
│           DATABASE LAYER                │
│  PostgreSQL                             │
│  • Relational data                      │
│  • Indexes & constraints                │
│  • Triggers & functions                 │
└─────────────────────────────────────────┘
```

### 1.3 Architecture modulaire (Frontend)

```
┌─────────────────────────────────────────┐
│              APP ROOT                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌───────────────────┐  │
│  │   CORE    │  │     SHARED        │  │
│  │           │  │                   │  │
│  │ • Guards  │  │ • Components      │  │
│  │ • Intercep│  │ • Directives      │  │
│  │ • Services│  │ • Pipes           │  │
│  └───────────┘  └───────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │          FEATURES               │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│   │
│  │ │Admin│ │ POS │ │Auth │ │Cust.││   │
│  │ │     │ │     │ │     │ │     ││   │
│  │ │ 20+ │ │ 14  │ │  3  │ │  4  ││   │
│  │ │comp.│ │comp.│ │comp.│ │comp.││   │
│  │ └─────┘ └─────┘ └─────┘ └─────┘│   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. Stack Technologique

### 2.1 Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Java** | 21 | Langage principal |
| **Spring Boot** | 3.5.6 | Framework backend |
| **Spring Security** | 6.x | Sécurité et authentification |
| **Spring Data JPA** | 3.x | ORM et accès données |
| **Spring WebSocket** | 3.x | Communication temps réel |
| **PostgreSQL** | 16 | Base de données relationnelle |
| **JWT (jjwt)** | 0.12.3 | Tokens d'authentification |
| **iText7** | 7.2.5 | Génération de rapports PDF |
| **ZXing** | 3.5.2 | Génération de QR Codes |
| **Lombok** | Latest | Réduction du boilerplate |
| **Jackson** | 2.x | Sérialisation JSON |
| **Maven** | 3.9+ | Build et gestion des dépendances |

### 2.2 Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Angular** | 20.1.0 | Framework SPA |
| **TypeScript** | 5.8.2 | Langage principal |
| **TailwindCSS** | 3.4.18 | Framework CSS utilitaire |
| **RxJS** | 7.8.0 | Programmation réactive |
| **Chart.js** | 4.5.1 | Graphiques de base |
| **ApexCharts** | 5.3.6 | Graphiques avancés |
| **ng2-charts** | 8.0.0 | Intégration Chart.js |
| **ngx-scanner** | Latest | Scan QR Code |

### 2.3 DevOps & Infrastructure

| Technologie | Usage |
|-------------|-------|
| **Docker** | Conteneurisation |
| **Docker Compose** | Orchestration locale |
| **Coolify** | Plateforme de déploiement |
| **PostgreSQL 16 Alpine** | Image Docker BDD |
| **Eclipse Temurin 21** | JRE Alpine |
| **Node 20 Alpine** | Build frontend |

---

## 3. Fonctionnalités Principales

### 3.1 Authentification & Autorisation

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY FLOW                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Login                                             │
│      │                                                  │
│      ▼                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Credentials │───►│ Validation  │───►│ JWT Token   │ │
│  │ (email/pwd) │    │ (bcrypt)    │    │ Generation  │ │
│  └─────────────┘    └─────────────┘    └──────┬──────┘ │
│                                               │        │
│                                               ▼        │
│                     ┌─────────────────────────────┐    │
│                     │ Access Token (1h)           │    │
│                     │ Refresh Token (5 days)      │    │
│                     └─────────────────────────────┘    │
│                                                         │
│  API Request                                            │
│      │                                                  │
│      ▼                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ JWT Token   │───►│ Validation  │───►│ Role Check  │ │
│  │ in Header   │    │ & Decode    │    │ (RBAC)      │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Caractéristiques :**
- Authentification JWT avec tokens expirables
- 5 rôles : ADMIN, CAISSE, CUISINE, BAR, AUDITOR
- Protection PIN pour les caisses (4 chiffres, bcrypt)
- Protection brute-force (3 tentatives = 15 min blocage)
- Auto-déconnexion après 15 min d'inactivité
- Protection XSS, SQL Injection, CSRF

### 3.2 Gestion Multi-Caisses

```
┌─────────────────────────────────────────────────────────┐
│              MULTI-CASHIER HIERARCHY                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GlobalSession (1 par jour)                             │
│      │                                                  │
│      ├─── CashierSession (Caisse 1, User A)            │
│      │        └─── Orders [#1001, #1002, #1003]        │
│      │                                                  │
│      ├─── CashierSession (Caisse 1, User B)            │
│      │        └─── Orders [#1004, #1005]               │
│      │                                                  │
│      ├─── CashierSession (Caisse 2, User C)            │
│      │        └─── Orders [#1006, #1007, #1008]        │
│      │                                                  │
│      └─── CashierSession (Caisse 3, User D)            │
│               └─── Orders [#1009]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Entités :**
- **GlobalSession** : Session journalière (Admin ouvre/ferme)
- **Cashier** : Caisse physique avec PIN
- **CashierSession** : Session utilisateur sur une caisse
- **CashierUsers** : Assignation utilisateurs ↔ caisses (N:N)

### 3.3 Système de Menus & Produits

```
┌─────────────────────────────────────────────────────────┐
│              PRODUCT HIERARCHY                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Category                                               │
│      │                                                  │
│      ├─── Product (workStation: KITCHEN)               │
│      │        ├─── name: "Pizza Margherita"            │
│      │        ├─── price: 5500                         │
│      │        └─── imageUrl: "/uploads/pizza.jpg"      │
│      │                                                  │
│      └─── Product (workStation: BAR)                   │
│               ├─── name: "Coca-Cola"                    │
│               └─── price: 1000                          │
│                                                         │
│  Menu                                                   │
│      │                                                  │
│      └─── MenuItem                                      │
│               ├─── displayOrder: 1                      │
│               ├─── priceOverride: 8000                  │
│               └─── Products: [Pizza, Salade, Coca]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Stations de travail (WorkStation) :**
- `KITCHEN` : Plats chauds, entrées
- `BAR` : Boissons, cocktails
- `PASTRY` : Desserts, pâtisseries
- `CHECKOUT` : Articles vendus directement

### 3.4 Système de Tickets (Dual-Mode)

```
┌─────────────────────────────────────────────────────────┐
│              TICKET SYSTEM                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MODE A: SEPARATED TICKETS                              │
│  ─────────────────────────                              │
│                                                         │
│  Order #1234                                            │
│      │                                                  │
│      ├─── Ticket BAR (priority: 1)                     │
│      │        └─── [Coca x2, Bière x1]                 │
│      │                                                  │
│      └─── Ticket KITCHEN (priority: 2)                 │
│               └─── [Pizza x1, Salade x1]               │
│                                                         │
│  → Bar prépare en premier                               │
│  → Cuisine attend que le bar soit prêt                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MODE B: UNIFIED TICKET                                 │
│  ──────────────────────                                 │
│                                                         │
│  Order #1234                                            │
│      │                                                  │
│      └─── Ticket UNIFIED                               │
│               ├─── [BAR] Coca x2, Bière x1             │
│               └─── [KITCHEN] Pizza x1, Salade x1       │
│                                                         │
│  → Un seul ticket imprimé à la caisse                  │
│  → Vue complète de la commande                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Gestion des Commandes

**Types de commandes :**
- `TABLE` : Service en salle
- `TAKEAWAY` : À emporter
- `DELIVERY` : Livraison (futur)

**Statuts de commande :**

```
ACCEPTEE ──► EN_PREPARATION ──► PRETE ──► LIVREE
    │
    └──────────────► ANNULEE
```

| Statut | Description | Couleur |
|--------|-------------|---------|
| `ACCEPTEE` | Nouvelle commande | Orange |
| `EN_PREPARATION` | En cours de préparation | Jaune |
| `PRETE` | Prête à servir | Vert |
| `LIVREE` | Servie au client | Bleu |
| `ANNULEE` | Annulée | Rouge |

### 3.6 Rapports & Analytics

**Types de rapports :**

| Type | Contenu | Format |
|------|---------|--------|
| **Session Globale** | CA total, commandes, top produits | JSON/PDF |
| **Par Caissier** | Performance d'une caisse | JSON/PDF |
| **Par Utilisateur** | Performance individuelle | JSON/PDF |

**Données incluses :**
- Résumé financier (CA, entrées, sorties, écart)
- Détail des commandes
- Top 10 produits vendus
- Heures de pointe
- Performance par utilisateur

### 3.7 Opérations de Caisse

**Types d'opérations :**
- `ENTREE` : Dépôt d'argent (fond de caisse, appoint)
- `SORTIE` : Retrait d'argent (achats, remboursements)

**Calcul de la trésorerie :**
```
Trésorerie = Solde Initial + Ventes + Entrées - Sorties
```

---

## 4. Modèle de Données

### 4.1 Diagramme Entité-Relation

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Role     │       │ ActiveToken │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───────│ id          │       │ id          │
│ publicId    │       │ name        │       │ token       │
│ email       │       │ permissions │       │ userId      │
│ password    │       └─────────────┘       │ expiresAt   │
│ firstName   │                             └─────────────┘
│ lastName    │
│ roleId (FK) │
└──────┬──────┘
       │
       │ N:N
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Cashier   │───────│CashierUsers │───────│    User     │
├─────────────┤       ├─────────────┤       └─────────────┘
│ id          │       │ cashierId   │
│ publicId    │       │ userId      │
│ name        │       │ assignedAt  │
│ number      │       └─────────────┘
│ pinHash     │
│ status      │
│ failedAttempts│
│ lockedUntil │
└──────┬──────┘
       │
       ▼
┌─────────────┐       ┌─────────────┐
│GlobalSession│◄──────│CashierSession│
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ publicId    │       │ publicId    │
│ status      │       │ globalSessionId│
│ initialAmount│      │ cashierId   │
│ finalAmount │       │ userId      │
│ openedAt    │       │ status      │
│ closedAt    │       │ openedAt    │
│ openedBy    │       │ closedAt    │
│ closedBy    │       │ lastActivity│
│ totalSales  │       └──────┬──────┘
└─────────────┘              │
                             │
                             ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Order     │───────│  OrderItem  │───────│  MenuItem   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ publicId    │       │ publicId    │       │ publicId    │
│ orderNumber │       │ orderId     │       │ menuId      │
│ type        │       │ menuItemId  │       │ displayOrder│
│ tableId     │       │ productId   │       │ priceOverride│
│ customerSessionId│  │ quantity    │       │ bundlePrice │
│ cashierSessionId│   │ unitPrice   │       └──────┬──────┘
│ status      │       │ totalPrice  │              │
│ totalAmount │       │ workStation │              │ N:N
│ discount    │       │ status      │              ▼
│ notes       │       │ notes       │       ┌─────────────┐
│ createdAt   │       └─────────────┘       │   Product   │
└─────────────┘                             ├─────────────┤
                                            │ id          │
┌─────────────┐       ┌─────────────┐       │ publicId    │
│  Category   │◄──────│   Product   │       │ name        │
├─────────────┤       ├─────────────┤       │ description │
│ id          │       │ categoryId  │       │ price       │
│ publicId    │       │ ...         │       │ workStation │
│ name        │       └─────────────┘       │ imageUrl    │
│ description │                             │ active      │
│ displayOrder│                             └─────────────┘
└─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Menu     │───────│  MenuItem   │───────│MenuItemProduct│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ menuId      │       │ menuItemId  │
│ publicId    │       │ ...         │       │ productId   │
│ name        │       └─────────────┘       └─────────────┘
│ type        │
│ active      │
└─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Restaurant  │───────│RestaurantTable│─────│CustomerSession│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ publicId    │       │ publicId    │       │ publicId    │
│ name        │       │ restaurantId│       │ tableId     │
│ address     │       │ number      │       │ active      │
│ phone       │       │ name        │       │ createdAt   │
│ taxId       │       │ capacity    │       └─────────────┘
└─────────────┘       │ qrCodeUrl   │
                      │ zone        │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Invoice   │       │CashOperation│       │   Ticket    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ publicId    │       │ publicId    │       │ publicId    │
│ invoiceNumber│      │ cashierSessionId│   │ customerSessionId│
│ orderId     │       │ type (IN/OUT)│      │ workStation │
│ totalAmount │       │ amount      │       │ status      │
│ createdAt   │       │ notes       │       │ priority    │
└─────────────┘       │ createdAt   │       │ printedAt   │
                      └─────────────┘       │ readyAt     │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐
│   Stock     │       │InventoryMovement│
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ productId   │       │ productId   │
│ quantity    │       │ type        │
│ minLevel    │       │ quantity    │
│ updatedAt   │       │ reference   │
└─────────────┘       │ createdAt   │
                      └─────────────┘

┌─────────────┐
│  AuditLog   │
├─────────────┤
│ id          │
│ entityType  │
│ entityId    │
│ action      │
│ userId      │
│ timestamp   │
│ details     │
└─────────────┘
```

### 4.2 Liste complète des entités (25)

| Entité | Description | Soft Delete |
|--------|-------------|-------------|
| `User` | Utilisateurs du système | Oui |
| `Role` | Rôles et permissions | Non |
| `ActiveToken` | Tokens JWT actifs | Non |
| `GlobalSession` | Sessions journalières | Oui |
| `Cashier` | Caisses physiques | Oui |
| `CashierSession` | Sessions caissier | Oui |
| `Restaurant` | Configuration restaurant | Oui |
| `RestaurantTable` | Tables du restaurant | Oui |
| `Category` | Catégories de produits | Oui |
| `Product` | Produits individuels | Oui |
| `Menu` | Menus groupés | Oui |
| `MenuItem` | Articles de menu | Oui |
| `CustomerSession` | Sessions client (table) | Oui |
| `Order` | Commandes | Oui |
| `OrderItem` | Lignes de commande | Oui |
| `Ticket` | Tickets de préparation | Oui |
| `Invoice` | Factures | Oui |
| `Payment` | Paiements | Non |
| `CashOperation` | Opérations de caisse | Oui |
| `Stock` | Niveaux de stock | Non |
| `InventoryMovement` | Mouvements de stock | Non |
| `AuditLog` | Journal d'audit | Non |
| `Notification` | Notifications | Non |
| `Setting` | Paramètres système | Non |

---

## 5. API REST Complète

### 5.1 Authentification (8 endpoints)

```http
POST   /api/auth/login                      # Connexion utilisateur
POST   /api/auth/logout                     # Déconnexion
POST   /api/auth/register                   # Inscription
POST   /api/auth/refresh-token              # Rafraîchir le JWT
GET    /api/auth/me                         # Info utilisateur courant
POST   /api/auth/change-password            # Changer mot de passe
POST   /api/auth/forgot-password            # Demande reset password
POST   /api/auth/reset-password             # Réinitialiser password
```

### 5.2 Sessions Globales (5 endpoints) - Admin

```http
POST   /api/global-sessions/open            # Ouvrir la session
GET    /api/global-sessions/current         # Session courante
POST   /api/global-sessions/{id}/close      # Fermer la session
GET    /api/global-sessions/{id}            # Détails session
GET    /api/global-sessions                 # Liste des sessions
```

### 5.3 Caisses (8 endpoints) - Admin

```http
POST   /api/cashiers                        # Créer une caisse
GET    /api/cashiers                        # Liste des caisses
GET    /api/cashiers/{id}                   # Détails caisse
PUT    /api/cashiers/{id}                   # Modifier caisse
DELETE /api/cashiers/{id}                   # Supprimer caisse
POST   /api/cashiers/{id}/change-pin        # Changer le PIN
POST   /api/cashiers/{id}/assign-user       # Assigner utilisateur
POST   /api/cashiers/{id}/remove-user       # Retirer utilisateur
```

### 5.4 Sessions Caissier (10 endpoints)

```http
POST   /api/cashier-sessions/open           # Ouvrir session
GET    /api/cashier-sessions/current        # Session courante
POST   /api/cashier-sessions/{id}/lock      # Verrouiller
POST   /api/cashier-sessions/{id}/unlock    # Déverrouiller (PIN)
POST   /api/cashier-sessions/{id}/close     # Fermer session
POST   /api/cashier-sessions/{id}/activity  # Mettre à jour activité
GET    /api/cashier-sessions/{id}           # Détails session
PUT    /api/cashier-sessions/{id}           # Modifier session
DELETE /api/cashier-sessions/{id}           # Supprimer session
GET    /api/cashier-sessions                # Liste des sessions
```

### 5.5 Utilisateurs (7 endpoints) - Admin

```http
POST   /api/users                           # Créer utilisateur
GET    /api/users                           # Liste utilisateurs
GET    /api/users/{id}                      # Détails utilisateur
PUT    /api/users/{id}                      # Modifier utilisateur
DELETE /api/users/{id}                      # Désactiver utilisateur
GET    /api/users/me                        # Utilisateur courant
PUT    /api/users/{id}/password             # Changer password
```

### 5.6 Produits (8 endpoints) - Admin

```http
POST   /api/products                        # Créer produit
GET    /api/products                        # Liste produits
GET    /api/products/{id}                   # Détails produit
PUT    /api/products/{id}                   # Modifier produit
DELETE /api/products/{id}                   # Supprimer produit
POST   /api/products/{id}/image             # Upload image
GET    /api/products/category/{id}          # Produits par catégorie
GET    /api/products/station/{station}      # Produits par station
```

### 5.7 Catégories (5 endpoints) - Admin

```http
POST   /api/categories                      # Créer catégorie
GET    /api/categories                      # Liste catégories
GET    /api/categories/{id}                 # Détails catégorie
PUT    /api/categories/{id}                 # Modifier catégorie
DELETE /api/categories/{id}                 # Supprimer catégorie
```

### 5.8 Menus (8 endpoints) - Admin

```http
POST   /api/menus                           # Créer menu
GET    /api/menus                           # Liste menus
GET    /api/menus/{id}                      # Détails menu
PUT    /api/menus/{id}                      # Modifier menu
DELETE /api/menus/{id}                      # Supprimer menu
POST   /api/menus/{id}/items                # Ajouter article
DELETE /api/menus/{id}/items/{itemId}       # Retirer article
GET    /api/menus/active                    # Menus actifs
```

### 5.9 Articles Menu (5 endpoints) - Admin

```http
POST   /api/menu-items                      # Créer article
GET    /api/menu-items/{id}                 # Détails article
PUT    /api/menu-items/{id}                 # Modifier article
DELETE /api/menu-items/{id}                 # Supprimer article
GET    /api/menu-items/menu/{id}            # Articles par menu
```

### 5.10 Tables (7 endpoints) - Admin

```http
POST   /api/tables                          # Créer table
GET    /api/tables                          # Liste tables
GET    /api/tables/{id}                     # Détails table
PUT    /api/tables/{id}                     # Modifier table
DELETE /api/tables/{id}                     # Supprimer table
GET    /api/tables/{id}/qr-code             # Télécharger QR code
GET    /api/tables/available                # Tables disponibles
```

### 5.11 Commandes (12 endpoints)

```http
POST   /api/orders                          # Créer commande
GET    /api/orders/{id}                     # Détails commande
GET    /api/orders                          # Liste commandes (paginée)
PUT    /api/orders/{id}                     # Modifier commande
PUT    /api/orders/{id}/status/{status}     # Changer statut
PUT    /api/orders/{id}/discount            # Appliquer remise
PUT    /api/orders/{id}/payment             # Marquer payée
GET    /api/orders/pending/unpaid           # Commandes non payées
GET    /api/orders/kitchen/active           # File cuisine
GET    /api/orders/bar/active               # File bar
GET    /api/orders/table/{tableId}          # Commandes par table
DELETE /api/orders/{id}                     # Annuler commande
```

### 5.12 Tickets (7 endpoints)

```http
POST   /api/tickets/session/{id}/generate/separated    # Tickets séparés
POST   /api/tickets/session/{id}/generate/unified      # Ticket unifié
GET    /api/tickets/station/{station}/active           # Tickets par station
GET    /api/tickets/session/{id}/status                # Statut session
PUT    /api/tickets/{id}/print                         # Marquer imprimé
PUT    /api/tickets/{id}/ready                         # Marquer prêt
PUT    /api/tickets/{id}/served                        # Marquer servi
```

### 5.13 Sessions Client (5 endpoints)

```http
POST   /api/customer-sessions               # Créer session
GET    /api/customer-sessions/{id}          # Détails session
GET    /api/customer-sessions/table/{id}    # Session par table
PUT    /api/customer-sessions/{id}/close    # Fermer session
GET    /api/customer-sessions/active        # Sessions actives
```

### 5.14 Opérations Caisse (6 endpoints)

```http
POST   /api/cash-operations                 # Créer opération
GET    /api/cash-operations                 # Liste opérations
GET    /api/cash-operations/{id}            # Détails opération
PUT    /api/cash-operations/{id}            # Modifier opération
GET    /api/cash-operations/session/{id}    # Par session
GET    /api/cash-operations/totals          # Totaux
```

### 5.15 Stocks (6 endpoints) - Admin

```http
POST   /api/stocks                          # Créer stock
GET    /api/stocks                          # Liste stocks
GET    /api/stocks/{id}                     # Détails stock
PUT    /api/stocks/{id}                     # Modifier stock
POST   /api/stocks/movement                 # Mouvement stock
GET    /api/stocks/alerts                   # Alertes stock bas
```

### 5.16 Rapports (6 endpoints) - Admin

```http
GET    /api/reports/global-session/{id}                 # JSON session
GET    /api/reports/cashier/{id}?startDate=...          # JSON caissier
GET    /api/reports/user/{id}?startDate=...             # JSON utilisateur
GET    /api/reports/global-session/{id}/pdf             # PDF session
GET    /api/reports/cashier/{id}/pdf?startDate=...      # PDF caissier
GET    /api/reports/user/{id}/pdf?startDate=...         # PDF utilisateur
```

### 5.17 Analytics (5 endpoints) - Admin

```http
GET    /api/analytics/summary               # Résumé KPIs
GET    /api/analytics/revenue-by-day        # CA par jour
GET    /api/analytics/top-products          # Top produits
GET    /api/analytics/peak-hours            # Heures de pointe
GET    /api/analytics/cashier-performance   # Performance caissiers
```

### 5.18 Factures (4 endpoints)

```http
GET    /api/invoices/{id}                   # Détails facture
GET    /api/invoices/search                 # Rechercher facture
GET    /api/invoices/{id}/pdf               # Télécharger PDF
GET    /api/invoices/order/{orderId}        # Facture par commande
```

### 5.19 Menu Public (2 endpoints) - Sans auth

```http
GET    /api/public/menu                     # Menu public
GET    /api/public/menu/{tableToken}        # Menu par QR code
```

### 5.20 Restaurant (4 endpoints) - Admin

```http
GET    /api/restaurants                     # Liste restaurants
GET    /api/restaurants/{id}                # Détails restaurant
PUT    /api/restaurants/{id}                # Modifier restaurant
PUT    /api/restaurants/{id}/logo           # Upload logo
```

---

## 6. Workflows Métier

### 6.1 Workflow Journalier Complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW JOURNALIER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MATIN - OUVERTURE                                              │
│  ─────────────────                                              │
│                                                                 │
│  08:00  Admin arrive                                            │
│    │                                                            │
│    ├─► Login: POST /api/auth/login                             │
│    │                                                            │
│    ├─► Vérifier stocks: GET /api/stocks/alerts                 │
│    │                                                            │
│    └─► Ouvrir session: POST /api/global-sessions/open          │
│                                                                 │
│  08:30  Caissiers arrivent                                      │
│    │                                                            │
│    ├─► Login: POST /api/auth/login                             │
│    │                                                            │
│    ├─► Sélectionner caisse                                      │
│    │                                                            │
│    └─► Ouvrir session: POST /api/cashier-sessions/open (PIN)   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  JOURNÉE - SERVICE                                              │
│  ─────────────────                                              │
│                                                                 │
│  Client arrive → Caissier prend commande                        │
│    │                                                            │
│    ├─► POST /api/orders                                        │
│    │   { tablePublicId, items: [{menuItemId, qty}] }           │
│    │                                                            │
│    └─► Système crée OrderItems avec workStation                │
│                                                                 │
│  Cuisine/Bar reçoit les commandes                               │
│    │                                                            │
│    ├─► GET /api/orders/kitchen/active (ou /bar/active)         │
│    │                                                            │
│    ├─► Préparer les plats/boissons                              │
│    │                                                            │
│    └─► PUT /api/orders/{id}/status/PRETE                       │
│                                                                 │
│  Service livre au client                                        │
│    │                                                            │
│    └─► PUT /api/orders/{id}/status/LIVREE                      │
│                                                                 │
│  Client paie                                                    │
│    │                                                            │
│    ├─► PUT /api/orders/{id}/payment                            │
│    │                                                            │
│    └─► Facture générée automatiquement                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SOIR - FERMETURE                                               │
│  ────────────────                                               │
│                                                                 │
│  22:00  Fin de service                                          │
│    │                                                            │
│    ├─► Caissiers ferment leurs sessions                         │
│    │   POST /api/cashier-sessions/{id}/close                   │
│    │                                                            │
│    ├─► Admin génère rapports                                    │
│    │   GET /api/reports/global-session/{id}                    │
│    │                                                            │
│    ├─► Admin compte l'argent                                    │
│    │                                                            │
│    └─► Admin ferme la session                                   │
│        POST /api/global-sessions/{id}/close                    │
│        { finalAmount, reconciliationNotes }                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Workflow de Prise de Commande

```
┌─────────────────────────────────────────────┐
│           ORDER CREATION FLOW               │
├─────────────────────────────────────────────┤
│                                             │
│  1. Sélection type: TABLE / TAKEAWAY        │
│         │                                   │
│         ▼                                   │
│  2. Sélection table (si TABLE)              │
│         │                                   │
│         ▼                                   │
│  3. Ajout articles au panier                │
│     • Parcourir menus                       │
│     • Filtrer par type                      │
│     • Rechercher                            │
│     • Cliquer pour ajouter                  │
│         │                                   │
│         ▼                                   │
│  4. Ajouter notes (optionnel)               │
│     • Allergies                             │
│     • Préférences cuisson                   │
│         │                                   │
│         ▼                                   │
│  5. Valider la commande                     │
│         │                                   │
│         ▼                                   │
│  6. Système:                                │
│     • Crée Order                            │
│     • Crée OrderItems                       │
│     • Assigne workStation                   │
│     • Lie à CashierSession                  │
│         │                                   │
│         ▼                                   │
│  7. Envoi en cuisine/bar                    │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.3 Workflow de Réconciliation

```
┌─────────────────────────────────────────────┐
│         RECONCILIATION WORKFLOW             │
├─────────────────────────────────────────────┤
│                                             │
│  1. Récupérer le résumé de session          │
│     GET /api/global-sessions/{id}/summary   │
│         │                                   │
│         ▼                                   │
│  2. Afficher les totaux:                    │
│     • Solde initial: 150 000                │
│     • Total ventes: 850 000                 │
│     • Entrées: +100 000                     │
│     • Sorties: -50 000                      │
│     ─────────────────────                   │
│     • Montant attendu: 1 050 000            │
│         │                                   │
│         ▼                                   │
│  3. Admin compte l'argent physique          │
│         │                                   │
│         ▼                                   │
│  4. Saisir montant réel: 1 048 000          │
│         │                                   │
│         ▼                                   │
│  5. Calcul écart: -2 000 (manque)           │
│         │                                   │
│         ▼                                   │
│  6. Expliquer dans les notes:               │
│     "Erreur de rendu monnaie table T05"     │
│         │                                   │
│         ▼                                   │
│  7. Fermer la session                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 7. Sécurité

### 7.1 Authentification

| Mécanisme | Configuration |
|-----------|---------------|
| Type | JWT (JSON Web Token) |
| Algorithme | HS256 |
| Access Token | 1 heure (configurable) |
| Refresh Token | 5 jours (configurable) |
| Stockage | Authorization Header |

### 7.2 Autorisation (RBAC)

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Toutes les permissions |
| **CAISSE** | Commandes, session caissier, rapports propres |
| **CUISINE** | Vue cuisine uniquement |
| **BAR** | Vue bar uniquement |

### 7.3 Protection des Caisses

| Protection | Configuration |
|------------|---------------|
| PIN | 4 chiffres uniquement |
| Hashage | bcrypt (cost factor 10) |
| Tentatives max | 3 |
| Durée blocage | 15 minutes |
| Déverrouillage | Automatique après délai |

### 7.4 Protection des Sessions

| Protection | Configuration |
|------------|---------------|
| Inactivité | Auto-logout 15 minutes |
| Tracking | Mise à jour toutes les 30 secondes |
| Unicité | 1 session par user/cashier |
| Prérequis | GlobalSession doit être OPEN |

### 7.5 Validation des Entrées

| Champ | Validation |
|-------|------------|
| PIN | Exactement 4 chiffres |
| Email | Format email valide |
| Quantité | Entier positif |
| Montant | Décimal positif |
| Remise | ≤ montant total |
| Période rapport | ≤ 30 jours |

### 7.6 Protections Diverses

- **XSS** : Échappement des sorties, sanitization
- **SQL Injection** : Prepared statements (JPA)
- **CSRF** : Token validation (Spring Security)
- **Brute-force** : Rate limiting, account lockout
- **Data Leakage** : Pas de données sensibles dans logs

---

## 8. Configuration

### 8.1 Variables d'Environnement

```bash
# ═══════════════════════════════════════════════
# BASE DE DONNÉES
# ═══════════════════════════════════════════════
DATABASE_URL=jdbc:postgresql://localhost:5432/sellia_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=sellia_db
DATABASE_PORT=5432

# ═══════════════════════════════════════════════
# HIBERNATE
# ═══════════════════════════════════════════════
HIBERNATE_DDL_AUTO=update
# Options: none, validate, update, create, create-drop
# Production: validate (après première init)

# ═══════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════
APP_SERVER_URL=http://localhost:8080
APP_BASE_URL=http://localhost:8080
BACKEND_PORT=8080
APP_PORT=8080

# ═══════════════════════════════════════════════
# JWT - SÉCURITÉ
# ═══════════════════════════════════════════════
JWT_SECRET=your-256-bit-secret-key-here-must-be-secure
JWT_ACCESS_TOKEN_EXPIRATION=3600000      # 1 heure en ms
JWT_REFRESH_TOKEN_EXPIRATION=432000000   # 5 jours en ms

# ═══════════════════════════════════════════════
# JAVA
# ═══════════════════════════════════════════════
JAVA_OPTS=-Xms512m -Xmx1024m

# ═══════════════════════════════════════════════
# UPLOADS
# ═══════════════════════════════════════════════
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10MB
```

### 8.2 Générer un JWT Secret Sécurisé

```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 8.3 Configuration Spring Boot

```properties
# application.properties

# Datasource
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=${HIBERNATE_DDL_AUTO:update}
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server
server.port=${BACKEND_PORT:8080}

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when_authorized
```

---

## 9. Monitoring

### 9.1 Health Check

```http
GET /actuator/health

Response:
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 350000000000
      }
    }
  }
}
```

### 9.2 Métriques Disponibles

```http
GET /actuator/metrics

Métriques principales:
- jvm.memory.used
- jvm.memory.max
- http.server.requests
- jdbc.connections.active
- process.cpu.usage
- system.cpu.usage
```

### 9.3 Logs

```bash
# Logs applicatifs
/var/log/sellia/application.log

# Niveaux de log
- ERROR : Erreurs critiques
- WARN  : Avertissements
- INFO  : Informations générales
- DEBUG : Débogage (dev only)
```

---

## 10. Déploiement

### 10.1 Docker Compose (Développement)

```bash
# Lancer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Lancer avec monitoring (Prometheus/Grafana/Loki)
docker-compose --profile monitoring up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### 10.2 Monitoring & Audit

Le système inclut une stack complète de monitoring accessible au rôle **AUDITOR** :

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard Audit | http://localhost:8080/auditor | Logs d'audit applicatifs |
| Grafana | http://localhost:3001 | Dashboards et visualisations |
| Prometheus | http://localhost:9090 | Métriques et alertes |
| Loki | http://localhost:3100 | Logs centralisés |

**Identifiants Grafana par défaut :**
- Utilisateur : `admin`
- Mot de passe : `admin`

**Fonctionnalités AUDITOR :**
- Consultation des logs d'audit (actions utilisateurs)
- Filtrage par date, utilisateur, type d'entité, statut
- Statistiques de succès/échec
- Accès aux métriques Actuator
- Lien direct vers Grafana et Prometheus

### 10.3 Production (Coolify)

1. **Créer service PostgreSQL** dans Coolify
2. **Configurer les variables** d'environnement
3. **Déployer l'application** depuis GitHub
4. **Configurer le domaine** et SSL
5. **Configurer les volumes** persistants

### 10.4 Vérification Post-Déploiement

```bash
# Health check
curl https://votre-domaine.com/actuator/health

# Connexion API
curl -X POST https://votre-domaine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Frontend
curl https://votre-domaine.com
```

---

## 11. Tests

### 11.1 Tests Backend

```bash
# Tous les tests
cd sellia-backend
mvn test

# Tests avec rapport de couverture
mvn test jacoco:report

# Tests d'un package spécifique
mvn test -Dtest=*ServiceTest

# Tests d'intégration
mvn verify -P integration-tests
```

### 11.2 Tests Frontend

```bash
# Tests unitaires
cd sellia-app
npm test

# Tests avec couverture
npm test -- --code-coverage

# Tests en mode watch
npm test -- --watch

# Tests e2e
npm run e2e
```

### 11.3 Collection Postman

Fichier disponible : `docs/Sellia_POS_API.postman_collection.json`

Contient tous les endpoints avec exemples de requêtes/réponses.

### 11.4 Checklist de Tests

```
✅ Authentification
   • Login valide/invalide
   • Token expiré
   • Refresh token
   • Permissions par rôle

✅ Sessions
   • Ouverture/fermeture globale
   • Ouverture/fermeture caissier
   • PIN valide/invalide
   • Blocage brute-force

✅ Commandes
   • Création avec articles
   • Changement de statut
   • Application remise
   • Paiement

✅ Rapports
   • Génération JSON
   • Génération PDF
   • Filtres par date
   • Permissions

✅ Sécurité
   • Injection SQL
   • XSS
   • CSRF
   • Escalade de privilèges
```

---

## Annexes

### A. Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 204 | No Content - Succès sans contenu |
| 400 | Bad Request - Requête invalide |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Non autorisé |
| 404 | Not Found - Ressource introuvable |
| 409 | Conflict - Conflit (doublon) |
| 422 | Unprocessable Entity - Validation échouée |
| 500 | Internal Server Error - Erreur serveur |

### B. Format des Dates

- **API** : ISO 8601 (`2024-11-18T10:30:00Z`)
- **Affichage** : `dd/MM/yyyy HH:mm`
- **Timezone** : UTC (serveur), locale (client)

### C. Format Monétaire

- **Devise** : FCFA (XAF)
- **Séparateur milliers** : espace (`1 000 000`)
- **Décimales** : 0 (pas de centimes)

---

**Version du système** : 1.0.0
**Dernière mise à jour** : Novembre 2024
**Statut** : ✅ PRODUCTION READY
