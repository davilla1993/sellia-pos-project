# 🔔 Système de Notifications Audio - Sellia POS

## Vue d'ensemble

Le système de notifications audio du Sellia POS permet aux **caissiers** et aux **cuisiniers** de recevoir des alertes sonores quand:

1. **Une nouvelle commande arrive** - Tous les membres du staff entendent un "bip" caractéristique
2. **Une commande est marquée PRÊTE** - Le caissier entend une mélodie deux-notes pour alerter les serveurs
3. **Un paiement est complété** - Son "ding!" de confirmation (pour extensibilité future)

## Architecture

### Services Principaux

#### 1. `AudioNotificationService`
**Fichier:** `src/app/core/services/audio-notification.service.ts`

Service responsable de la **génération et lecture des sons** utilisant la Web Audio API.

**Fonctionnalités:**
- Génération synthétique de sons (aucun fichier externe)
- Contrôle du volume (0-1)
- Activation/Désactivation globale
- Persistance des paramètres via localStorage

**API:**
```typescript
// Reproduction des sons
playNewOrder()      // Bip bip bip (3 bips)
playOrderReady()    // 2-note melody
playPaymentComplete() // Ding!

// Contrôle
toggleNotifications(): void     // Activer/Désactiver
setVolume(volume: number): void // 0-1

// État
notificationsEnabled: Signal<boolean>
volume: Signal<number>
```

#### 2. `OrderNotificationService`
**Fichier:** `src/app/core/services/order-notification.service.ts`

Service responsable du **monitoring des changements de commande** via polling (tous les 10 secondes).

**Fonctionnalités:**
- Polling des commandes actives
- Détection des nouvelles commandes
- Détection du changement de statut PRETE
- Reproduction automatique des sons
- Nettoyage des ressources

**API:**
```typescript
// Cycle de vie
startMonitoring(): void    // Démarrer le polling
stopMonitoring(): void     // Arrêter le polling

// Observable
orderStatusChanged: Observable<OrderStatusChange>
```

### Composants UI

#### 1. `AudioNotificationControlComponent`
**Fichier:** `src/app/shared/components/audio-notification-control.component.ts`

Composant **réutilisable** pour afficher les contrôles de notification.

**Affichage:**
- Bouton Actif/Désactivé 🔊/🔇
- Curseur de volume (0-100%)
- Bouton Test pour écouter un bip

**Usage:**
```html
<app-audio-notification-control></app-audio-notification-control>
```

#### 2. `PosLayoutComponent` (Caisse)
**Fichier:** `src/app/features/pos/pos-layout.component.ts`

Layout principal pour la caisse avec contrôle audio intégré.

**Changements:**
- Ajout du composant audio-notification-control dans le header
- Injection de OrderNotificationService
- Implémentation OnDestroy pour cleanup

#### 3. `KitchenLayoutComponent` (Cuisine) [NOUVEAU]
**Fichier:** `src/app/features/pos/kitchen-layout.component.ts`

Layout dédié pour l'interface cuisine avec contrôle audio.

#### 4. `CashierLayoutComponent` [NOUVEAU]
**Fichier:** `src/app/features/pos/cashier-layout.component.ts`

Layout dédié pour l'interface caisse.

## Flux de Fonctionnement

### Scénario 1: Nouvelle Commande Arrive
```
Client passe commande
     ↓
API crée la commande (status: EN_ATTENTE)
     ↓
OrderNotificationService.checkForChanges() détecte une nouvelle commande
     ↓
AudioNotificationService.playNewOrder() → 🔊 "Bip bip bip"
     ↓
Caissier + Cuisinier entendent l'alerte
```

### Scénario 2: Commande Marquée PRÊTE
```
Cuisinier clique "Marquer prêt" (kitchen.component)
     ↓
API met à jour status: PRETE
     ↓
OrderNotificationService.checkForChanges() détecte le changement
     ↓
AudioNotificationService.playOrderReady() → 🔊 "Mélodie deux-notes"
     ↓
Caissier entend l'alerte pour préparer la livraison
```

### Cycle de Monitoring
```
setInterval(10 secondes) {
  apiService.getActiveOrders()
  ├─ Pour chaque commande:
  │  ├─ Si nouvelle (pas vue avant):
  │  │  └─ playNewOrder()
  │  └─ Si status changé vers PRETE:
  │     └─ playOrderReady()
  └─ Cleanup des commandes supprimées
}
```

## Configuration et Utilisation

### Pour les Utilisateurs

**Activer/Désactiver:**
1. Localiser le bouton 🔊/🔇 en haut à gauche de l'interface
2. Cliquer pour activer/désactiver
3. Les paramètres sont sauvegardés automatiquement

**Régler le Volume:**
1. Cliquer le curseur 🔇 ← → 🔊
2. Tester avec le bouton 🎵

### Pour les Développeurs

**Intégration dans un nouveau composant:**
```typescript
import { OrderNotificationService } from '../../core/services/order-notification.service';

export class MonComponent implements OnInit, OnDestroy {
  private orderNotificationService = inject(OrderNotificationService);

  ngOnInit() {
    this.orderNotificationService.startMonitoring();
  }

  ngOnDestroy() {
    this.orderNotificationService.stopMonitoring();
  }
}
```

**Émettre des sons manuellement:**
```typescript
import { AudioNotificationService } from '../../core/services/audio-notification.service';

export class MonComponent {
  private audioService = inject(AudioNotificationService);

  onSomethingHappens() {
    this.audioService.playNewOrder();
    // ou
    this.audioService.playOrderReady();
  }
}
```

## Persistance des Préférences

Les paramètres utilisateur sont stockés dans **localStorage**:

```json
{
  "audioNotificationSettings": {
    "enabled": true,
    "volume": 0.7
  }
}
```

- **Accessible**: `localStorage.getItem('audioNotificationSettings')`
- **Restauré automatiquement** au démarrage du service

## Sons Synthétiques

Les trois sons sont générés synthétiquement avec la Web Audio API:

### 🔊 Son "Nouvelle Commande" (new-order)
- **Fréquence:** 800 Hz
- **Durée:** 0.5 secondes
- **Motif:** 3 bips répétés
- **Amortissement:** Decay graduel
- **Utilisation:** Alerte nouvelle commande

### 🎵 Son "Commande Prête" (order-ready)
- **Fréquence:** 600 Hz → 800 Hz (2 notes)
- **Durée:** 0.6 secondes
- **Motif:** Mélodie ascendante
- **Utilisation:** Alerte commande prête pour caissier

### 🎧 Son "Paiement Complété" (payment-complete)
- **Fréquence:** 1200 Hz
- **Durée:** 0.3 secondes
- **Amortissement:** Decay rapide (ding!)
- **Utilisation:** Confirmation paiement (extensibilité future)

**Avantage:** Aucun fichier audio externe à télécharger → moins de latence, plus rapide.

## Compatibilité

- **Chrome/Edge:** ✅ Pleinement supporté
- **Firefox:** ✅ Pleinement supporté
- **Safari:** ✅ Pleinement supporté (audio context)
- **Mobile (Android):** ✅ Fonctionne
- **Mobile (iOS):** ⚠️ Nécessite interaction utilisateur d'abord

## Dépannage

### Les sons ne jouent pas
1. **Vérifier** si les notifications sont activées (bouton 🔊)
2. **Tester** le bouton 🎵
3. **Vérifier** le volume du système/navigateur
4. **Vérifier** la console navigateur pour les erreurs

### Problème de synchronisation
- Le monitoring s'exécute tous les 10 secondes
- Délai maximum avant notification: 10 secondes
- Pour une latence plus basse: passer à WebSocket (voir TODO)

## Améliorations Futures

### 🚀 Court terme
- [ ] Notifications visuelles (toast/badge) en complément audio
- [ ] Historique des notifications reçues
- [ ] Sons personnalisables par role (caissier vs cuisinier)

### 📡 Long terme
- [ ] Remplacer polling par WebSocket pour latence réelle-temps
- [ ] Support notifications push du navigateur
- [ ] Feedback haptique sur mobile
- [ ] Sons pour d'autres événements (paiement rejeté, etc.)

## Ressources

- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Angular Signals:** https://angular.dev/guide/signals
- **RxJS interval:** https://rxjs.dev/api/index/function/interval

---

**Créé:** Phase 2 - Audio Notification System
**Dernière mise à jour:** 2025-10-21
