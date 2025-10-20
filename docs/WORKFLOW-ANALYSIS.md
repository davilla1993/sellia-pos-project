# Analyse Complète des Workflows de Commandes

## Synthèse Executive

Le système doit supporter **2 workflows distincts** avec une logique partagée clé:
- **Workflow 1 (QR Code):** Client autonome → Caissier accepte → Cuisine traite → Client paie
- **Workflow 2 (Serveur):** Serveur prend commande → Caissier enregistre → Cuisine traite → Client paie

**Point critique:** Dans BOTH workflows, le caissier peut AJOUTER de nouvelles commandes tant que le client n'a pas payé, MAIS ne peut pas modifier les commandes déjà en préparation.

---

## WORKFLOW 1: Commande par QR Code

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Table)                                                  │
├─────────────────────────────────────────────────────────────────┤

1. SCAN QR CODE
   └─ Accès à /qr/{qrToken}
   └─ CustomerSession créée automatiquement

2. PREMIÈRE COMMANDE
   ├─ Client ajoute items au panier
   ├─ POST /api/public/orders
   └─ Order #1 créée avec status: EN_ATTENTE
       ├─ Linked to CustomerSession
       └─ Linked to Table

3. CAISSIER ACCEPTE COMMANDE
   ├─ Reçoit Order #1 (EN_ATTENTE)
   ├─ PUT /api/orders/{id}/status/ACCEPTEE
   └─ Order #1 → ACCEPTEE
       └─ Envoyée à la cuisine

4. CUISINE TRAITE COMMANDE #1
   ├─ Reçoit Order #1 (ACCEPTEE)
   ├─ PUT /api/orders/{id}/status/EN_PREPARATION
   ├─ PUT /api/orders/{id}/status/PRETE
   └─ PUT /api/orders/{id}/status/LIVREE
       └─ Prête à servir

5. CLIENT COMMANDE PLUSIEURS FOIS (tant que pas payé)
   ├─ Scanne QR à nouveau (même token)
   ├─ CustomerSession RÉUTILISÉE (active = true)
   ├─ POST /api/public/orders (nouvelle commande)
   └─ Order #2, #3, etc. créées
       ├─ Toutes linked à MÊME CustomerSession
       └─ Status: EN_ATTENTE

6. CAISSIER ACCEPTE COMMANDE #2, #3, etc.
   ├─ PUT /api/orders/{id}/status/ACCEPTEE
   └─ Envoie à cuisine

7. CUISINE TRAITE PARALLÈLEMENT
   ├─ Order #1: LIVREE ✓
   ├─ Order #2: EN_PREPARATION
   └─ Order #3: EN_ATTENTE

8. CLIENT VA À LA CAISSE
   ├─ Caissier voit CustomerSession
   ├─ Récupère TOUTES les commandes (Order #1, #2, #3, ...)
   ├─ Crée UN SEUL REÇU consolidé (Invoice)
   └─ Invoice contient les 3 commandes

9. PAIEMENT
   ├─ Client paie le total
   ├─ Caissier marque comme payé: PUT /api/orders/{id}/payment
   ├─ Statut change: EN_ATTENTE → PAYEE
   └─ Toutes les orders de la session marquées PAYEE

10. FIN DE SESSION
    ├─ POST /api/customer-sessions/{id}/finalize
    ├─ Session: active = false
    ├─ Reçu imprimé/donné
    └─ FIN ✓

┌──────────────────────────────┐
│ STATUTS D'UNE ORDER          │
├──────────────────────────────┤
│ EN_ATTENTE  → En salle       │
│ ACCEPTEE    → Acceptée caisse│
│ EN_PREPARATION → Cuisine    │
│ PRETE       → Prête à servir │
│ LIVREE      → Servie client  │
│ PAYEE       → Payée ✓        │
│ ANNULEE     → Annulée       │
└──────────────────────────────┘
```

---

## WORKFLOW 2: Commande par Serveur/Serveuse

```
┌─────────────────────────────────────────────────────────────────┐
│ SERVEUR/SERVEUSE (Prend la commande du client)                 │
├─────────────────────────────────────────────────────────────────┤

1. PREMIÈRE COMMANDE
   ├─ Serveur/Se prend les items demandés
   ├─ Serveur va à la caisse
   ├─ Caissier enregistre: POST /api/orders
   │  ├─ Items fournis par le serveur
   │  ├─ CustomerSession créée (ou existante si même table)
   │  └─ Order #1 créée: EN_ATTENTE
   └─ Serveur retourne à la table

2. CAISSIER ACCEPTE & ENVOIE EN CUISINE
   ├─ Caissier reçoit Order #1 (EN_ATTENTE)
   ├─ PUT /api/orders/{id}/status/ACCEPTEE
   └─ Order #1 → Envoyée à cuisine

3. CUISINE TRAITE COMMANDE #1
   ├─ EN_PREPARATION → PRETE → LIVREE
   └─ Prêt à servir

4. CLIENT COMMANDE À NOUVEAU
   ├─ Serveur retourne à la table
   ├─ Client donne nouvelle commande
   ├─ Serveur note les items
   └─ Serveur retourne à la caisse

5. CAISSIER ENREGISTRE COMMANDE #2
   ├─ Reçoit infos du serveur
   ├─ IMPORTANT: Table SAME (même CustomerSession)
   ├─ Caissier a 2 options:

   OPTION A: AJOUTER ITEMS À LA COMMANDE #1
   (SI Order #1 en EN_ATTENTE)
   ├─ PUT /api/orders/{id}/add-items
   ├─ Ajoute nouveaux items
   └─ Montant TOTAL calculé
       └─ Order #1 reste EN_ATTENTE (pas encore acceptée)

   OPTION B: CRÉER NOUVELLE COMMANDE #2
   (SI Order #1 déjà ACCEPTEE/EN_PREPARATION+)
   ├─ POST /api/orders
   ├─ Crée Order #2
   ├─ IMPORTANT: Même CustomerSession ID
   └─ Order #2: EN_ATTENTE (indépendante)

   NB: Le caissier choisit l'option selon le statut de Order #1

6. PLUSIEURS CYCLES DE COMMANDES
   ├─ Client commande à nouveau → Serveur → Caissier
   ├─ Répète OPTION A ou OPTION B selon statuts
   └─ Crée Order #1, #2, #3, ... (ou ajoute items à #1)

7. EXEMPLE RÉEL:
   ├─ 14:00 - Order #1: Pizza, Coca (EN_ATTENTE)
   │  └─ Caissier accepte → ACCEPTEE
   │  └─ Cuisine start → EN_PREPARATION
   │
   ├─ 14:05 - Client veut ajouter: Dessert
   │  └─ Order #1 déjà EN_PREPARATION
   │  └─ Caissier CRÉE Order #2 (NOUVELLE): Dessert (EN_ATTENTE)
   │
   ├─ 14:10 - Client veut ajouter: Bière
   │  └─ Order #2 toujours EN_ATTENTE (pas encore acceptée)
   │  └─ Caissier AJOUTE items à Order #2: +Bière
   │  └─ Order #2: Pizza, Dessert, Bière
   │
   └─ Résultat FINAL:
       ├─ Order #1: Pizza, Coca (LIVREE ✓)
       └─ Order #2: Dessert, Bière (EN_ATTENTE/EN_PREP...)

8. CLIENT VA À LA CAISSE POUR PAYER
   ├─ Caissier voit CustomerSession
   ├─ Récupère TOUTES les Order (#1, #2, ...)
   ├─ Crée UN SEUL REÇU (Invoice)
   │  ├─ Order #1 items
   │  └─ Order #2 items
   └─ Total = tous les items

9. PAIEMENT
   ├─ Caissier accepte paiement
   ├─ Marque TOUTES les orders comme PAYEE
   ├─ Status: EN_ATTENTE → PAYEE
   └─ Invoice marquée PAYEE

10. FIN DE SESSION
    ├─ POST /api/customer-sessions/{id}/finalize
    ├─ Session: active = false
    └─ FIN ✓

┌──────────────────────────────┐
│ RESTRICTIONS CAISSIER       │
├──────────────────────────────┤
│ ✓ Ajouter items à order      │
│   EN_ATTENTE                 │
│                              │
│ ✗ Modifier order             │
│   EN_PREPARATION+            │
│                              │
│ ✓ Créer nouvelle order       │
│   si l'ancienne est           │
│   EN_PREPARATION+            │
│                              │
│ ✓ Accepter/payer toutes      │
│   les orders ensemble         │
│                              │
│ ✓ Imprimer reçu consolidé   │
│   (une seule facture)        │
└──────────────────────────────┘
```

---

## Points Clés à Implémenter

### 1. **Ajouter des items à une Order EN_ATTENTE**
```java
PUT /api/orders/{orderId}/add-items
{
  "items": [
    {"menuItemPublicId": "item-1", "quantity": 2}
  ]
}
Response:
{
  "success": true,
  "orderId": "ord-123",
  "newTotal": 7500,
  "message": "2 items added, total updated to 7,500 XAF"
}
```

### 2. **Créer une nouvelle Order pour même CustomerSession**
```java
POST /api/orders (with customerSessionId)
{
  "customerSessionPublicId": "sess-abc",
  "items": [{"menuItemPublicId": "item-2", "quantity": 1}]
}
Response:
{
  "publicId": "ord-456",
  "orderNumber": "20251020-5678",
  "status": "EN_ATTENTE",
  "totalAmount": 2500,
  "message": "Order #2 created for same session"
}
```

### 3. **Récupérer toutes les Orders unpaid d'une Session**
```java
GET /api/customer-sessions/{sessionId}/orders?status=unpaid
Response:
{
  "sessionId": "sess-abc",
  "table": "5",
  "orders": [
    {
      "orderId": "ord-123",
      "orderNumber": "001",
      "status": "LIVREE",
      "totalAmount": 5000,
      "items": [...]
    },
    {
      "orderId": "ord-456",
      "orderNumber": "002",
      "status": "EN_PREPARATION",
      "totalAmount": 2500,
      "items": [...]
    }
  ],
  "grandTotal": 7500,
  "invoiceNumber": "INV-20251020-001"
}
```

### 4. **Générer Reçu Consolidé**
```java
POST /api/customer-sessions/{sessionId}/checkout
{
  "paymentMethod": "CASH"
}
Response:
{
  "invoiceNumber": "INV-20251020-001",
  "orders": 2,
  "items": 5,
  "subtotal": 7500,
  "discount": 0,
  "tax": 0,
  "total": 7500,
  "status": "PAID",
  "paidAt": "2025-10-20T14:35:00Z"
}
```

### 5. **Finaliser la Session**
```java
POST /api/customer-sessions/{sessionId}/finalize
Response:
{
  "sessionId": "sess-abc",
  "status": "CLOSED",
  "finalizedAt": "2025-10-20T14:35:30Z",
  "totalOrders": 2,
  "totalAmount": 7500,
  "message": "Session closed, customer can leave"
}
```

---

## Statuts et Transitions Valides

```
EN_ATTENTE
    ├─ → ACCEPTEE (caissier accepte)
    ├─ → ANNULEE (client annule)
    └─ CAN ADD ITEMS ✓

ACCEPTEE
    ├─ → EN_PREPARATION (cuisine start)
    ├─ → ANNULEE (kitchen cancel)
    └─ CANNOT MODIFY ✗

EN_PREPARATION
    ├─ → PRETE (kitchen ready)
    └─ CANNOT MODIFY ✗

PRETE
    ├─ → LIVREE (served to customer)
    └─ CANNOT MODIFY ✗

LIVREE
    ├─ → PAYEE (client pays)
    └─ CANNOT MODIFY ✗

PAYEE
    └─ FINAL STATE ✓

ANNULEE
    └─ FINAL STATE ✓
```

---

## Scénario de Test Complet (Workflow 2)

### Étape par Étape
```
14:00 - COMMANDE #1
┌─────────────────────────────────────────────┐
│ Serveur prend note: Pizza, Coca             │
│ ↓ Caissier enregistre                       │
│ POST /api/orders                            │
│ ├─ customerSessionPublicId: sess-abc        │
│ ├─ items: [{pizza, qty:1}, {coca, qty:1}]  │
│ ↓                                           │
│ Order #1 créée: EN_ATTENTE (5,000 XAF)     │
│ ↓ Caissier accepte                         │
│ PUT /api/orders/ord-001/status/ACCEPTEE    │
│ ↓                                           │
│ Order #1: ACCEPTEE → envoyée cuisine       │
└─────────────────────────────────────────────┘

14:05 - COMMANDE #2
┌─────────────────────────────────────────────┐
│ Client ajoute: Tiramisu                      │
│ ↓ Serveur: "Order #1 déjà en préparation"  │
│ ↓ Caissier doit CRÉER nouvelle order        │
│ POST /api/orders                            │
│ ├─ customerSessionPublicId: sess-abc (SAME)│
│ ├─ items: [{tiramisu, qty:1}]              │
│ ↓                                           │
│ Order #2 créée: EN_ATTENTE (1,500 XAF)     │
│ ↓ Caissier accepte                         │
│ PUT /api/orders/ord-002/status/ACCEPTEE    │
│ ↓                                           │
│ Order #2: ACCEPTEE → envoyée cuisine       │
└─────────────────────────────────────────────┘

14:10 - COMMANDE #3
┌─────────────────────────────────────────────┐
│ Client ajoute: Bière                        │
│ ↓ Serveur: "Order #2 pas encore acceptée?" │
│ ↓ VÉRIFIER statut Order #2                  │
│ GET /api/orders/ord-002/status              │
│ ↓ Status: EN_ATTENTE (pas encore en prep)   │
│ ↓ Caissier peut AJOUTER items               │
│ PUT /api/orders/ord-002/add-items           │
│ ├─ newItems: [{bière, qty:1}]              │
│ ↓                                           │
│ Order #2 mis à jour: EN_ATTENTE (2,000 XAF)│
│ Order #2 items: Tiramisu, Bière             │
│ ↓ Caissier accepte (si pas encore acceptée)│
│ PUT /api/orders/ord-002/status/ACCEPTEE    │
└─────────────────────────────────────────────┘

14:35 - CLIENT À LA CAISSE
┌─────────────────────────────────────────────┐
│ Caissier clique: "Finaliser session"        │
│ POST /api/customer-sessions/sess-abc/checkout
│ ↓                                           │
│ Récupère TOUTES les orders:                 │
│ - Order #1: Pizza, Coca → LIVREE (5,000)   │
│ - Order #2: Tiramisu, Bière → PRETE (2,000)│
│ ↓                                           │
│ Crée Invoice consolidée:                    │
│ ├─ Numéro: INV-20251020-12345              │
│ ├─ Items: Pizza, Coca, Tiramisu, Bière     │
│ ├─ Subtotal: 7,000 XAF                     │
│ ├─ Discount: 0 XAF                         │
│ └─ TOTAL: 7,000 XAF                        │
│ ↓                                           │
│ Client paie: 7,000 XAF                     │
│ ↓ Caissier marque comme payé                │
│ PUT /api/orders/ord-001/payment (CASH)     │
│ PUT /api/orders/ord-002/payment (CASH)     │
│ ↓                                           │
│ Orders: PAYEE                               │
│ Invoice: PAID                               │
│ ↓ Finalise session                          │
│ POST /api/customer-sessions/sess-abc/finalize
│ ↓                                           │
│ Session: CLOSED                             │
│ ✓ Reçu imprimé                             │
│ ✓ FIN                                       │
└─────────────────────────────────────────────┘
```

---

## Validation des Points Critiques

### ✅ DÉJÀ IMPLÉMENTÉ
- [x] Order model avec CustomerSession link
- [x] OrderStatus enum avec tous les états
- [x] Status transition validation
- [x] Mark order as paid
- [x] Cannot update if paid
- [x] Cannot update if EN_PREPARATION+

### ❌ À IMPLÉMENTER
- [ ] **addItemsToOrder()** - Ajouter items à order EN_ATTENTE
- [ ] **createOrderForExistingSession()** - Nouvelle order pour même session
- [ ] **getSessionUnpaidOrders()** - Récupérer orders unpaid
- [ ] **consolidatedCheckout()** - Créer invoice et marquer toutes les orders payées
- [ ] **finalizeCustomerSession()** - Fermer la session complètement
- [ ] **checkoutUI** - Interface caisse pour finaliser
- [ ] **Validation stricte** - Empêcher modification de orders EN_PREP+

---

## Architecture Globale

```
CustomerSession (table/client)
├─ Order #1: Pizza, Coca
│  ├─ Status: LIVREE
│  └─ Amount: 5,000 XAF
│
├─ Order #2: Tiramisu, Bière
│  ├─ Status: EN_ATTENTE
│  └─ Amount: 2,000 XAF
│
└─ Invoice (generated at checkout)
   ├─ InvoiceNumber: INV-20251020-001
   ├─ Orders: [#1, #2]
   ├─ Total: 7,000 XAF
   └─ Status: PAID
```

