# Plan de Développement - Gestion des Caisses

## Phase 1: Corrections urgentes (Priorité haute) 🔴

### 1.1 - Corriger le bug last_login

**Backend:**
- Mettre à jour `AuthService.java` pour enregistrer `lastLogin` lors de la connexion
- Ajouter après validation du mot de passe (ligne 34):
  ```java
  user.setLastLogin(LocalDateTime.now());
  userRepository.save(user);
  ```

**Frontend:**
- Ajouter le champ `lastLogin` dans l'interface `User` (types.ts)
- Format: `lastLogin?: string | Date;`

### 1.2 - Simplifier l'authentification caisse (selon logs.md)

**Flux d'authentification en 2 étapes:**

1. **Étape 1: Login classique**
   - Caissier entre username + password
   - Validation des identifiants
   - Redirection vers l'écran de sélection/validation de caisse

2. **Étape 2: Validation du code PIN**
   - Écran dédié où le caissier entre son code PIN
   - Validation du PIN
   - Ouverture automatique de la session sur sa caisse assignée
   - Redirection vers le dashboard POS

**Affichage de la caisse:**
- Afficher le nom ou numéro de caisse dans un coin du dashboard
- Information visible mais discrète

**Composants à modifier:**
- `login.component`: Garder pour l'authentification username/password
- `cashier-selection.component`: Transformer en écran de validation PIN uniquement
- Dashboard caissier: Ajouter l'affichage de la caisse assignée

**Backend:**
- Endpoint pour récupérer la caisse assignée au caissier connecté
- Validation du PIN lors de l'ouverture de session
- Ouverture automatique de session après validation du PIN

**Avantages:**
- Plus sécurisé: pas d'exposition de la liste des caisses
- UX claire: séparation des étapes d'authentification
- Contrôle: validation en deux temps (identité puis autorisation caisse)

---

## Phase 2: Compléter la gestion des caisses (Priorité moyenne) 🟡

### 2.1 - Interface d'administration des caisses

**Compléter le composant `cashiers.component`:**
- Édition complète des caisses:
  - Nom de la caisse
  - Description
  - Localisation physique
  - Fonds de caisse initial
- Historique des sessions par caisse
- Statistiques par caisse (CA, nombre de transactions, etc.)

### 2.2 - Affectation des caissiers

**Améliorer `cashier-assignment.component`:**
- Afficher les caissiers actuellement affectés à chaque caisse
- Permettre la réaffectation d'un caissier à une autre caisse
- Validation métier:
  - Un caissier ne peut être affecté qu'à une seule caisse à la fois
  - Impossible d'affecter un caissier si une session est ouverte
- Historique des affectations

### 2.3 - Gestion des PINs

**Fonctionnalités:**
- Interface admin pour réinitialiser les PINs des caissiers
- Forcer le changement de PIN au premier login
- Politique de PIN (longueur minimale, complexité)
- Historique des changements de PIN (sans stockage du PIN lui-même)
- Notification au caissier lors de la réinitialisation

---

## Phase 3: Tableau de bord et rapports (Priorité moyenne) 🟡

### 3.1 - Dashboard des sessions actives

**Vue en temps réel pour l'admin:**
- Liste des caisses ouvertes/fermées
- Caissiers actuellement connectés
- Montants en caisse
- Durée des sessions en cours
- Dernière transaction par caisse
- Alertes visuelles (session trop longue, inactivité, etc.)

**Visualisations:**
- Graphique: évolution des transactions en temps réel
- Carte: vue spatiale des caisses (si localisation renseignée)

### 3.2 - Rapports de caisse

**Interface de consultation:**
- Rapport de fermeture de caisse détaillé:
  - Fonds de départ
  - Total des ventes
  - Montant attendu
  - Montant réel déclaré
  - Écart (positif/négatif)
  - Liste des transactions
- Historique des sessions par caisse (filtres: date, caissier, caisse)
- Performance par caissier:
  - Nombre de transactions
  - Montant moyen
  - Temps moyen par transaction
  - Taux d'erreur

**Export:**
- PDF pour impression
- Excel pour analyse
- Envoi par email automatique

---

## Phase 4: Améliorations UX (Priorité basse) 🟢

### 4.1 - Auto-verrouillage intelligent

**Fonctionnalités:**
- Paramétrage du délai d'inactivité par restaurant (admin)
- Détection d'inactivité (pas de transaction, pas de mouvement)
- Notification avant verrouillage automatique:
  - Toast 1 minute avant
  - Possibilité de prolonger la session
- Verrouillage progressif:
  - Après X minutes: avertissement
  - Après X+5 minutes: verrouillage

### 4.2 - Notifications

**Alertes pour l'admin:**
- Caisse ouverte trop longtemps (paramétrable)
- Écart de caisse détecté à la fermeture
- Tentatives de déverrouillage échouées (3 essais)
- Caissier inactif depuis X minutes
- Anomalie dans les transactions (montant inhabituel, etc.)

**Canaux de notification:**
- In-app (dashboard admin)
- Email (configurable)
- SMS (optionnel, pour alertes critiques)

---

## Phase 5: Tests et monitoring (Priorité basse) 🟢

### 5.1 - Tests

**Tests unitaires:**
- `AuthService.login()`: vérifier que lastLogin est bien mis à jour
- `CashierSessionService`: ouverture, fermeture, calculs d'écarts
- Validation du PIN (BCrypt)

**Tests d'intégration:**
- Flux complet d'authentification (login → PIN → session)
- Ouverture/fermeture de session avec transactions
- Verrouillage/déverrouillage

**Tests E2E:**
- Scénario caissier complet:
  - Login → validation PIN → transactions → fermeture
- Scénario admin:
  - Affectation caissier → réinitialisation PIN → consultation rapports

### 5.2 - Logging et audit

**Logger toutes les actions sensibles:**
- Ouverture/fermeture de session (qui, quand, quelle caisse, montants)
- Verrouillage/déverrouillage (qui, quand, succès/échec)
- Changements de PIN (qui a changé, pour qui, quand)
- Affectations/désaffectations de caissiers (admin, caissier, caisse, date)
- Modifications de caisse (champs modifiés, anciennes/nouvelles valeurs)
- Tentatives d'accès refusées (raison du refus)

**Format des logs:**
- Timestamp
- Action
- Utilisateur (qui a fait l'action)
- Ressource affectée (caisse, caissier, session)
- Résultat (succès/échec)
- Détails supplémentaires

**Rétention:**
- Conservation des logs: 1 an minimum
- Archivage automatique après 6 mois
- Consultation via interface admin

---

## Priorités d'implémentation

### ✅ À faire maintenant (Phase 1)
1. Corriger le bug last_login
2. Implémenter le flux d'authentification en 2 étapes
3. Afficher la caisse assignée dans le dashboard

### 📋 À faire ensuite (Phase 2)
4. Compléter l'interface d'administration des caisses
5. Améliorer l'affectation des caissiers
6. Gestion complète des PINs

### 📊 Après (Phase 3)
7. Dashboard temps réel des sessions
8. Rapports et exports

### 🎨 Optionnel (Phases 4 et 5)
9. Améliorations UX (auto-verrouillage, notifications)
10. Tests complets et monitoring avancé

---

## Notes techniques

### Sécurité
- PINs toujours hashés avec BCrypt
- Tokens JWT avec expiration courte pour les caissiers
- Validation côté serveur de toutes les opérations sensibles
- Rate limiting sur les tentatives de PIN

### Performance
- Cache des caisses assignées (éviter requêtes répétées)
- Lazy loading des historiques de sessions
- Pagination sur les rapports
- Index sur les champs fréquemment requêtés (cashier_id, session dates)

### UX
- Feedback visuel immédiat sur toutes les actions
- Messages d'erreur clairs et en français
- Raccourcis clavier pour les actions fréquentes
- Mode hors-ligne pour consultation des données (optionnel)
