# 📋 Plan de Continuité - Sellia POS Backend

**Date:** 16 Octobre 2025  
**État:** Phase 2 complète | Phase 3 ready to start

---

## ✅ Résumé Session Actuelle

### Phase 1: Authentification & Utilisateurs
- ✅ JWT + Refresh Tokens (15min/5days)
- ✅ Rôles (ADMIN, CAISSIER, CUISINE)
- ✅ Endpoints Auth + Users
- ✅ French error messages
- ✅ Password validation

### Phase 2: Produits, Menus & Tables
- ✅ Category CRUD avec images
- ✅ Product CRUD + file upload (5MB limit)
- ✅ Menu CRUD
- ✅ MenuItem ManyToMany (supports simples items + combos)
  - MenuItemCreateRequest/UpdateRequest/Response
  - MenuItemService/Controller/Repository/Mapper
  - Calcul prix bundle automatique
- ✅ RestaurantTable CRUD
- ✅ SecurityConfig: GET endpoints publics, POST/PUT/DELETE protégés
- ✅ Compilation réussie

**Commits:**
- `1bb193c` - MenuItem ManyToMany support
- `e5f5221` - GET endpoints public
- `3ce8ba9` - ApiError timestamp removed
- `88b9b1f` - MenuItem DTOs & full stack

---

## 🚀 Phase 3: Commandes & Workflow (À DÉMARRER)

### 3.1 Order Management (Week 1)
**Objectif:** Créer système complet de commandes avec workflow

#### Tâches:
```
1. ✅ OrderRepository
   - findByPublicId(publicId)
   - findByTableId + Pageable
   - findByStatus + Pageable
   - findByCreatedAtBetween (reports)

2. ✅ OrderItemRepository
   - findByOrderId

3. ✅ OrderDTO Stack
   - OrderCreateRequest (menuItemIds, specialInstructions)
   - OrderUpdateRequest (status, discount)
   - OrderResponse (full with items, total price)
   - OrderItemResponse

4. ✅ OrderMapper
   - toEntity() → calcul prix total
   - toResponse() → formatage complet
   - Support pour discounts

5. ✅ OrderService
   - createOrder(tableId, items)
   - updateOrderStatus(orderId, newStatus)
   - addDiscountToOrder(orderId, percent/amount)
   - calculateOrderTotal()
   - getOrdersByStatus(status, pageable)

6. ✅ OrderController
   - POST /api/orders (create)
   - GET /api/orders/{id}
   - GET /api/orders/table/{tableId}
   - GET /api/orders/status/{status}
   - PUT /api/orders/{id}/status
   - PUT /api/orders/{id}/discount
   - GET /api/orders/customer-session/{sessionId}
```

#### Order Statuses:
```
PENDING → ACCEPTED → IN_PREPARATION → READY → DELIVERED
```

---

### 3.2 WebSocket Notifications (Week 1-2)
**Objectif:** Communication temps réel caisse ↔ cuisine

#### Tâches:
```
1. ✅ WebSocket Configuration
   - WebSocketConfig.java
   - Enable STOMP messaging

2. ✅ WebSocket Endpoints
   - /ws/orders (subscribe)
   - /app/orders/{id}/status (publish)

3. ✅ NotificationService
   - notifyOrderStatusChange()
   - notifyCuisineNewOrder()
   - notifyCashierOrderReady()

4. ✅ Real-time Events
   - OrderStatusChangedEvent
   - NewOrderReceivedEvent
```

#### Topics:
```
/topic/orders/{tableId}         → Client sees status changes
/topic/kitchen                  → Kitchen receives new orders
/topic/cashier                  → Cashier gets ready notifications
```

---

### 3.3 QR Code Generation (Week 1)
**Objectif:** Générer QR codes pour tables

#### Tâches:
```
1. ✅ Add ZXing dependency to pom.xml

2. ✅ QrCodeService
   - generateTableQrCode(tableId)
   - saveToFile(/uploads/qrcodes)
   - Return QR code URL

3. ✅ QR Code Endpoint
   - GET /api/tables/{tableId}/qrcode
   - GET /api/qrcodes/{filename}

4. ✅ TableResponse
   - Add qrCodeUrl field
```

#### QR Code Contents:
```
https://pos.sellia.io/menu?table=TABLE_ID&session=SESSION_ID
```

---

## 📅 Phase 4: Inventaire & Rapports (Week 2-3)

### 4.1 Stock Management
```
- StockService: CRUD + inventory movements
- StockRepository: queries
- InventoryMovementService: tracking
- Stock endpoints: GET /api/stock
```

### 4.2 Reports & Analytics
```
- ReportService: daily sales, top products, cashier performance
- ReportController: GET /api/reports/daily, /top-products, /cashier-performance
```

---

## 📅 Phase 5: Customer Interface (Week 3-4)

### Frontend (Angular 19):
```
1. QR Code Scanner
2. Menu Display (by MenuType)
3. Order Placement
4. Order Status Tracking (WebSocket)
5. Real-time notifications
```

---

## 🎯 Priorités Pour Demain

### HAUTE PRIORITÉ:
1. **OrderRepository + OrderItemRepository** création
2. **Order DTOs** (Create/Update/Response)
3. **OrderMapper** avec calcul prix total
4. **OrderService** avec CRUD complet
5. **OrderController** avec tous endpoints
6. **Tests compilation**

### MOYENNE PRIORITÉ:
7. Commencer WebSocket configuration
8. QrCodeService basic
9. Tester Order endpoints avec Postman

### À EXPLORER:
- Payment entity (Payment gateway integration)
- CustomerSession entity (pour tracking tables via QR)

---

## 📋 Checklist Demain

```
☐ Order/OrderItem Repository
☐ Order DTOs (3 files)
☐ OrderMapper
☐ OrderService
☐ OrderController
☐ Tests mvn compile
☐ Update Postman collection
☐ Push commits to master
```

---

## 🔧 Configuration Importante

**Fichiers à vérifier:**
- `SecurityConfig.java` - Ajouter patterns GET pour /api/orders/** (public read)
- `application.yml` - Vérifier database + autres configs
- `pom.xml` - Ajouter ZXing dependency si nécessaire

---

## 💡 Notes Techniques

### ManyToMany vs OneToMany Decision:
MenuItem → Products: **ManyToMany** ✅
- Permet items simples (1 produit)
- Permet combos (N produits)
- Flexible pour futur

### Soft Delete Pattern:
- Toutes entities ont `deletedAt` implicite via BaseEntity
- Aucune suppression physique

### Price Calculation:
```java
if (menuItem.getBundlePrice() != null) {
    price = bundlePrice;
} else {
    price = sum(product.price for each product);
}
```

---

## 🔗 Architecture Reminder

```
Controller (endpoint) 
    ↓
Service (business logic)
    ↓
Repository (database)
    ↓
Entity (JPA)

DTOs:
- *CreateRequest (création)
- *UpdateRequest (modification)
- *Response (retour API)

Mapper:
- Entity → DTO
- DTO → Entity
- Custom logic (prix, concatenation, etc)
```

---

## 📞 Questions à Résoudre Demain

1. Comment gérer les "modifications de commande" (change item, cancel)?
2. Invoice generation - avant ou après Phase 4?
3. Payment gateway integration scope?
4. Customer feedback/rating feature?

---

**Next Session: Démarrer Phase 3 avec Order Management!** 🚀
