# Customer Journey - Sellia POS

Ce document décrit les deux parcours clients supportés par le système et comment ils sont implémentés.

---

## 📱 Parcours 1: Client scanne QR Code

### Flux:
1. **Client scanne QR code** → Passe commande via l'app
2. **Caissier accepte** la commande (status: EN_ATTENTE → ACCEPTEE)
3. **Cuisine reçoit** la commande et accepte (status: ACCEPTEE → EN_PREPARATION)
4. **Cuisine gère les statuts** jusqu'à LIVREE
5. **Client vient à la caisse** pour payer
6. **Caissier encaisse** (status: LIVREE → PAYEE)
7. **FIN**: Session de la table terminée

### Implémentation:

#### Création de session:
```http
POST /api/customer-sessions
{
  "tablePublicId": "table-uuid",
  "orderType": "TABLE"
}
```

#### Création de commande (par le client):
```http
POST /api/orders
{
  "customerSessionPublicId": "session-uuid",
  "orderType": "TABLE",
  "tablePublicId": "table-uuid",
  "items": [
    {
      "menuPublicId": "menu-uuid",
      "quantity": 1
    }
  ]
}
```

#### Commandes multiples dans la même session:
Le client peut passer plusieurs commandes en scannant le QR code. Chaque nouvelle commande utilise le même `customerSessionPublicId`.

#### Checkout final (paiement):
```http
POST /api/orders/session/{customerSessionPublicId}/checkout?paymentMethod=CASH
```

Cette requête:
- ✅ Récupère toutes les commandes non payées de la session
- ✅ Crée une invoice consolidée
- ✅ Marque toutes les commandes comme PAYEE
- ✅ Marque la session comme payée
- ✅ Un seul reçu pour toutes les commandes

---

## 👨‍🍳 Parcours 2: Serveur/Serveuse prend la commande

### Flux:
1. **Serveur/Serveuse** prend la commande du client
2. **Caissier enregistre** la commande via POS
3. **Cuisine reçoit** et accepte
4. **Cuisine gère les statuts** jusqu'à LIVREE
5. **Client paie**
6. **Caissier encaisse** (status: → PAYEE)
7. **FIN**

### Implémentation:

#### Création de session + commande (par le caissier):
```http
POST /api/customer-sessions
{
  "orderType": "TAKEAWAY",
  "customerName": "John Doe",
  "customerPhone": "+221771234567"
}
```

```http
POST /api/orders
{
  "customerSessionPublicId": "session-uuid",
  "orderType": "TAKEAWAY",
  "customerName": "John Doe",
  "customerPhone": "+221771234567",
  "items": [
    {
      "menuPublicId": "menu-uuid",
      "quantity": 2
    }
  ]
}
```

#### Commandes multiples:
Le caissier peut créer plusieurs commandes dans la même session en utilisant le même `customerSessionPublicId`.

---

## 🔄 Règles Métier Importantes

### ✅ Ajout de produits à une commande existante

**Règle:** Le caissier peut ajouter des produits à une commande **TANT QUE LE CLIENT N'A PAS PAYÉ**, peu importe le statut de la commande.

#### Implémentation:
```http
POST /api/orders/{orderId}/items
{
  "items": [
    {
      "menuPublicId": "new-menu-uuid",
      "quantity": 1
    }
  ]
}
```

**Validations:**
- ✅ Peut ajouter si status = EN_ATTENTE
- ✅ Peut ajouter si status = ACCEPTEE
- ✅ Peut ajouter si status = EN_PREPARATION
- ✅ Peut ajouter si status = PRETE
- ✅ Peut ajouter si status = LIVREE
- ❌ NE PEUT PAS ajouter si isPaid = true
- ❌ NE PEUT PAS ajouter si status = ANNULEE

**Important:** On n'ajoute QUE de nouveaux items. On ne modifie PAS les items existants déjà en préparation.

---

## 📊 Statuts des Commandes

### Workflow complet:
```
EN_ATTENTE (créée, en attente d'acceptation)
    ↓
ACCEPTEE (acceptée par caissier/serveur)
    ↓
EN_PREPARATION (cuisine commence)
    ↓
PRETE (cuisine a terminé)
    ↓
LIVREE (servie au client)
    ↓
PAYEE (client a payé)
```

### Statut alternatif:
```
ANNULEE (commande annulée)
```

---

## 💰 Gestion des Paiements

### Paiement d'une commande individuelle:
```http
POST /api/orders/{orderId}/pay?paymentMethod=CASH
```

### Paiement de toute la session (recommandé):
```http
POST /api/orders/session/{customerSessionPublicId}/checkout?paymentMethod=CASH
```

**Méthodes de paiement supportées:**
- CASH (Espèces)
- CARD (Carte bancaire)
- MOBILE_MONEY (Orange Money, Wave, etc.)

---

## 🧾 Récapitulatif et Facture

### Récupérer toutes les commandes d'une session:
```http
GET /api/orders/session/{customerSessionPublicId}/all
```

### Récupérer les commandes non payées:
```http
GET /api/orders/session/{customerSessionPublicId}/unpaid
```

### Récupérer la facture consolidée:
Après le checkout, une invoice consolidée est créée automatiquement par le système.

---

## 🔑 Points Clés d'Implémentation

### 1. CustomerSession
- **Objectif:** Regrouper plusieurs commandes d'un même client/table
- **Cycle de vie:** 
  - Créée au début (scan QR ou enregistrement caissier)
  - Active pendant toute la durée du repas
  - Fermée après paiement final
- **Champs importants:**
  - `active`: Boolean (true tant que non payée)
  - `isPaid`: Boolean (true après checkout)
  - `tablePublicId`: Lien vers la table (pour commandes TABLE)

### 2. Order
- **Relation:** Plusieurs Orders → 1 CustomerSession
- **Statuts:** EN_ATTENTE, ACCEPTEE, EN_PREPARATION, PRETE, LIVREE, PAYEE, ANNULEE
- **Champs importants:**
  - `customerSessionPublicId`: Lien vers la session
  - `status`: Statut actuel
  - `isPaid`: Boolean
  - `totalAmount`: Montant total

### 3. OrderItem
- **Relation:** Plusieurs OrderItems → 1 Order
- **Contraintes DB:**
  - `product_id`: NOT NULL (obligatoire)
  - `status`: NOT NULL (défaut: PENDING)
  - `workStation`: NOT NULL (défaut: KITCHEN)
  - `menu_item_id`: NULLABLE (peut être null pour menu complet)

### 4. Invoice
- **Création:** Automatique lors du checkout de session
- **Contenu:** Regroupe toutes les commandes de la session
- **Unicité:** Une invoice par session

---

## ✅ Tests à Effectuer

### Scénario 1: Client QR Code
1. Créer session pour Table 1
2. Client passe commande 1 (Menu Poulet)
3. Caissier accepte
4. Client passe commande 2 (Boissons) dans la même session
5. Cuisine prépare les deux commandes
6. Client paie → Checkout session
7. Vérifier qu'une seule facture est générée

### Scénario 2: Serveur prend commande
1. Caissier crée session TAKEAWAY
2. Caissier enregistre commande 1
3. Client demande plus → Caissier ajoute items à commande 1
4. Client demande autre chose → Caissier crée commande 2 dans même session
5. Client paie → Checkout session
6. Vérifier facture consolidée

### Scénario 3: Ajout après préparation
1. Créer commande
2. Cuisine commence préparation (EN_PREPARATION)
3. Client demande autre chose
4. Caissier ajoute items (doit réussir)
5. Vérifier que nouveaux items sont ajoutés

---

## 🐛 Problèmes Résolus

### ✅ Contrainte NOT NULL sur `status`
- **Solution:** OrderMapper définit maintenant status=PENDING par défaut

### ✅ Contrainte NOT NULL sur `product_id`
- **Solution:** 
  - Menu chargé avec JOIN FETCH pour charger products
  - Validation ajoutée: product obligatoire
  - Message d'erreur en français

### ✅ Restriction addItemsToOrder
- **Problème:** Ne permettait l'ajout que si status=EN_ATTENTE
- **Solution:** Permet l'ajout tant que !isPaid, peu importe le statut

---

## 📝 Notes Importantes

1. **Ne jamais modifier les items existants** - Seulement ajouter de nouveaux items
2. **Une seule facture par session** - Même si plusieurs commandes
3. **Session active obligatoire** - Ne peut pas créer commande sur session fermée
4. **Product obligatoire** - Chaque OrderItem doit avoir un Product lié
5. **Menu avec products** - Les Menus doivent contenir au moins un MenuItem avec Products

---

**Date de création:** 2025-10-23  
**Version:** 1.0  
**Statut:** ✅ Implémenté et testé
