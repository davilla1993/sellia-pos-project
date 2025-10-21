# 📦 Guide d'Intégration - Notifications Audio

## Quick Start pour les Développeurs

### ✅ Déjà Intégré

Les composants suivants ont **déjà les notifications audio activées:**

- ✅ `PosLayoutComponent` (Caisse principale)
- ✅ `KitchenLayoutComponent` (Interface cuisine)
- ✅ `CashierLayoutComponent` (Interface caisse)
- ✅ `OrderNotificationService` (Monitoring automatique)
- ✅ `AudioNotificationControlComponent` (Contrôles UI)

### 🚀 Pour Ajouter dans un Nouveau Composant

**Étape 1:** Importer les services
```typescript
import { OrderNotificationService } from '../../core/services/order-notification.service';
import { AudioNotificationService } from '../../core/services/audio-notification.service';
```

**Étape 2:** Injecter et implémenter OnDestroy
```typescript
export class MonComponent implements OnInit, OnDestroy {
  private orderNotificationService = inject(OrderNotificationService);
  private audioService = inject(AudioNotificationService);

  ngOnInit() {
    // Démarrer le monitoring des changements de commande
    this.orderNotificationService.startMonitoring();
  }

  ngOnDestroy() {
    // Arrêter quand le composant est détruit
    this.orderNotificationService.stopMonitoring();
  }
}
```

**Étape 3:** Ajouter le contrôle UI (optionnel)
```html
<app-audio-notification-control></app-audio-notification-control>
```

### 🎵 Jouer des Sons Manuellement

```typescript
// Nouvelle commande
this.audioService.playNewOrder();

// Commande prête
this.audioService.playOrderReady();

// Paiement complété
this.audioService.playPaymentComplete();

// Activer/Désactiver les notifications
this.audioService.toggleNotifications();

// Régler le volume (0-1)
this.audioService.setVolume(0.8);
```

## Architecture Technique

### Flux de Données
```
┌─────────────────────────────────────────────┐
│         Component (POS/Kitchen)             │
└──────────────────┬──────────────────────────┘
                   │ inject()
                   ↓
        ┌──────────────────────┐
        │ OrderNotification    │
        │ Service             │
        └──────────┬───────────┘
                   │ startMonitoring()
                   │ setInterval(10s)
                   ↓
        ┌──────────────────────┐
        │ ApiService           │
        │ getActiveOrders()    │
        └──────────┬───────────┘
                   │ response
                   ↓
        ┌──────────────────────┐
        │ Detect Changes:      │
        │ - New Order          │
        │ - Status Changed     │
        └──────────┬───────────┘
                   │ trigger sound
                   ↓
        ┌──────────────────────┐
        │ AudioNotification    │
        │ Service             │
        │ play(soundType)      │
        └──────────┬───────────┘
                   │ Web Audio API
                   ↓
        ┌──────────────────────┐
        │ 🔊 Speaker           │
        └──────────────────────┘
```

### Fichiers du Système

```
src/app/
├── core/services/
│   ├── audio-notification.service.ts        [Synthèse audio]
│   └── order-notification.service.ts        [Monitoring & Trigger]
├── shared/components/
│   └── audio-notification-control.component.ts [UI Contrôles]
└── features/pos/
    ├── pos-layout.component.ts              [Intégration Caisse]
    ├── kitchen-layout.component.ts          [Intégration Cuisine - NOUVEAU]
    ├── cashier-layout.component.ts          [Layout Caisse - NOUVEAU]
    └── kitchen.component.ts                 [Logique Cuisine Existante]
```

## Cas d'Usage

### 1️⃣ Nouvelle Commande Arrive
**Utilisateurs affectés:** Caissier + Cuisinier

```
Client → Frontend → POST /api/orders
  ↓
OrderNotificationService.checkForChanges()
  ↓
Detected: ORDER.status = "EN_ATTENTE" (nouveau)
  ↓
AudioNotificationService.playNewOrder()
  ↓
🔊 "Bip bip bip!" dans les haut-parleurs
```

**Code:**
```typescript
// Automatique - pas de code manuel requis
// Le polling détecte et joue le son
```

### 2️⃣ Commande Marquée PRÊTE
**Utilisateurs affectés:** Cuisinier → Caissier

```
Cuisinier → UI: "Marquer prêt"
  ↓
kitchen.component.ts:
  updateOrderStatus(orderId, 'PRETE')
  ↓
API: PATCH /api/orders/{id}/status → PRETE
  ↓
OrderNotificationService.checkForChanges()
  ↓
Detected: status changed EN_PREPARATION → PRETE
  ↓
AudioNotificationService.playOrderReady()
  ↓
🔊 "Mélodie deux-notes!" pour le caissier
```

**Code dans kitchen.component.ts:**
```typescript
updateOrderStatus(orderId: string, newStatus: string): void {
  this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
    next: () => {
      // Audio est joué automatiquement par le monitoring
      this.toast.success(`✓ ${newStatus}`);
      this.loadOrders();
    }
  });
}
```

### 3️⃣ Utilisateur Désactive les Notifications
**Action:** Clic sur le bouton 🔇

```
User → Click: 🔊 "Actif" button
  ↓
audioService.toggleNotifications()
  ↓
notificationsEnabled.set(false)
  ↓
saveSettings() → localStorage
  ↓
🔇 Button changes to "Désactivé"
  ↓
AudioService.play() → early return (skip si disabled)
```

## Monitoring Cycle (Tous les 10 secondes)

```
Time 0:00
  ├─ API: getActiveOrders()
  ├─ ✓ Order #1: status="EN_ATTENTE" (nouveau) → playNewOrder()
  └─ ✓ Order #2: status="EN_PREPARATION" (ancien)

Time 0:10
  ├─ API: getActiveOrders()
  ├─ ✓ Order #1: status="EN_PREPARATION" (pas de changement)
  └─ ✓ Order #2: status="PRETE" (changé!) → playOrderReady()

Time 0:20
  ├─ API: getActiveOrders()
  ├─ (Order #1 supprimée du résultat - cleanup)
  └─ ✓ Order #2: status="LIVREE" (pas de son)
```

## Performance & Optimisations

### Polling Interval: 10 secondes
**Justification:**
- Assez rapide pour une notification quasi-réelle-temps
- Assez lent pour ne pas surcharger l'API
- Bon compromis entre réactivité et ressources

**Améliorations futures:**
- WebSocket pour ~0ms latence
- Server-Sent Events (SSE) comme alternative

### Memory Management
- `lastSeenOrders` Map: Trackage des commandes vues
- Cleanup automatique des commandes supprimées
- Destruction du polling dans `ngOnDestroy()`

### localStorage Persistence
- Volume & Enabled state sauvegardés
- Restaurés automatiquement au démarrage
- Pas de perte de préférences utilisateur

## Dépannage

### Problème: Les sons ne jouent pas
**Checklist:**
- [ ] Notifications activées? (bouton visible: 🔊)
- [ ] Volume > 0? (curseur à droite)
- [ ] Tester avec le bouton 🎵?
- [ ] Vérifier console: `F12 → Console`
- [ ] Vérifier volume du système d'exploitation

### Problème: Sons tardifs
**Cause possible:** Polling interval de 10s
**Solution:** 
- Acceptable pour la plupart des cas
- Pour urgent: Réduire à 5s dans OrderNotificationService
- Optimal: Implémenter WebSocket

### Problème: Sons multiples/echo
**Vérifier:**
- Plusieur onglets ouverts? (chacun a son monitoring)
- Solution: Fermer onglets en doublon
- Amélioration: Cookie/SessionStorage pour sync onglets

## API Reference

### AudioNotificationService

```typescript
class AudioNotificationService {
  // Signals
  notificationsEnabled: Signal<boolean>
  volume: Signal<number>

  // Play sounds
  playNewOrder(): void
  playOrderReady(): void
  playPaymentComplete(): void
  play(soundType: SoundType): void

  // Control
  toggleNotifications(): void
  setVolume(volume: number): void

  // Internal
  private createNewOrderSound(): void
  private createOrderReadySound(): void
  private createPaymentCompleteSound(): void
  private saveSettings(): void
  private loadSettings(): void
}
```

### OrderNotificationService

```typescript
class OrderNotificationService {
  // Lifecycle
  startMonitoring(): void
  stopMonitoring(): void

  // Observable
  orderStatusChanged: Observable<OrderStatusChange>

  // Management
  clearTracking(): void

  // Internal
  private checkForChanges(orders: any[]): void
}
```

## Tests

### Test Manuel

**Test 1: Audio Enabled**
1. Ouvrir POS layout
2. Bouton 🔊 = "Actif" (vert)
3. Créer nouvelle commande
4. ✓ Entendre "bip bip bip"

**Test 2: Audio Disabled**
1. Cliquer bouton 🔊 → "Désactivé" (rouge)
2. Créer nouvelle commande
3. ✓ Aucun son

**Test 3: Volume Control**
1. Curseur à minimum
2. Bouton 🎵 → Aucun son (ou très faible)
3. Curseur à maximum
4. Bouton 🎵 → Son fort

**Test 4: Persistance**
1. Régler volume = 30%, Désactiver audio
2. Rafraîchir page (F5)
3. ✓ Volume = 30%, Audio = Désactivé

---

**Pour Support:** Consulter `AUDIO-NOTIFICATIONS.md` pour la documentation complète.
