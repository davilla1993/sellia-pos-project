# Guide de Test Fonctionnel - Sellia POS

## 🚀 Préparation

### Backend
```bash
cd sellia-backend
mvn clean package -DskipTests
# Lancer l'app (port 8080)
java -jar target/sellia-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd sellia-app
npm run start
# Accès: http://localhost:4200
```

### Database
- PostgreSQL doit tourner avec les migrations Flyway
- V006 crée automatiquement les données de test

---

## 📋 Test Scenarios

### 1. User Creation - Password Validation ❌ (Invalid)

**Objectif:** Vérifier que les messages d'erreur sont clairs quand le mot de passe est invalide

**Steps:**
1. Aller à `/admin/users`
2. Cliquer "Nouvel utilisateur"
3. Remplir le formulaire:
   - Username: `testuser1`
   - Email: `test1@example.com`
   - Prénom: `Test`
   - Nom: `User`
   - Rôle: `Caissier`
   - Mot de passe: `abc` (INVALIDE - trop court)
4. Soumettre le formulaire

**Résultat attendu:**
- ✅ Message en temps réel: "Le mot de passe doit contenir: au moins 6 caractères, une lettre majuscule, un chiffre, un caractère spécial"
- ✅ Bouton "Créer" désactivé (form invalid)
- ✅ PAS de requête API envoyée

**Échoue si:**
- ❌ Form invalid ne désactive pas le bouton
- ❌ Le validateur ne montre aucune erreur

---

### 2. User Creation - Missing Uppercase

**Steps:**
1. Même formulaire, mot de passe: `abcdef123!` (pas de majuscule)
2. Soumettre

**Résultat attendu:**
- ✅ Message: "...une lettre majuscule..."
- ✅ Bouton désactivé

---

### 3. User Creation - Missing Digit

**Steps:**
1. Mot de passe: `Abcdef!` (pas de chiffre)
2. Soumettre

**Résultat attendu:**
- ✅ Message: "...un chiffre..."

---

### 4. User Creation - Missing Special Char

**Steps:**
1. Mot de passe: `Abcdef123` (pas de spécial)
2. Soumettre

**Résultat attendu:**
- ✅ Message: "...un caractère spécial..."

---

### 5. User Creation - Valid Password ✅ Success

**Steps:**
1. Mot de passe: `Abcdef123!` (VALIDE)
2. Remplir les autres champs correctement
3. Soumettre

**Résultat attendu:**
- ✅ Requête POST `/api/users` envoyée
- ✅ Backend retourne 201 Created
- ✅ Redirect vers `/admin/users`
- ✅ Nouvel utilisateur visible dans la liste

**Échoue si:**
- ❌ Erreur 400 / 500 du serveur
- ❌ Backend retourne "An unexpected error occurred"

---

### 6. User Creation - Duplicate Email

**Steps:**
1. Créer utilisateur avec email `testuser@example.com` (première fois - succès)
2. Tenter créer un autre utilisateur avec MÊME email
3. Soumettre

**Résultat attendu:**
- ✅ Erreur du backend: "Email already exists"
- ✅ Message affiché en haut du formulaire: "email: Email already exists"

---

### 7. Analytics Page - Real Data Loading

**Objectif:** Vérifier que les analytics se chargent avec vraies données de la DB

**Steps:**
1. Login avec admin@sella.com / (password provided)
2. Aller à `/admin/analytics`
3. Attendre le chargement (loader doit disparaître)

**Résultat attendu:**
- ✅ Page affiche les KPIs: Revenue, Transactions, Average Order, Discounts, %
- ✅ Les chiffres correspondent aux données de test (V006):
  - Revenue total: ~134,000 FCFA
  - Transactions: 10
  - Discounts: ~7,200 FCFA
- ✅ Tableau "Top Products" avec les 5 produits
- ✅ Graphique "Revenue par jour"
- ✅ Tableau "Performance Caissiers" avec 3 caissiers:
  - Jean Dupont: ~45K revenue
  - Marie Martin: ~54K revenue
  - Pierre Bernard: ~35K revenue
- ✅ Graphique "Heures de pointe" avec les 12 heures
- ✅ Sessions actives: 3

**Échoue si:**
- ❌ Loader infini (bug WebSocket ou API)
- ❌ Aucune donnée affichée
- ❌ Sessions actives = 0
- ❌ Erreur console (404, 500, etc)

---

### 8. Settings - Restaurant Settings

**Steps:**
1. Aller à Settings `/admin/settings`
2. Cliquer "Restaurant Settings"
3. Vérifier les champs

**Résultat attendu:**
- ✅ Modal s'ouvre
- ✅ Champs pré-remplis avec données du restaurant
- ✅ Pas d'erreur 404

---

### 9. Settings - Security Settings

**Steps:**
1. Aller à Settings
2. Cliquer "Security Settings"

**Résultat attendu:**
- ✅ Modal s'ouvre
- ✅ "Active Sessions: 3" (chargé du backend)
- ✅ Pas d'erreur console
- ✅ PAS de "Active Sessions: 0" ou hardcodé "3"

---

## 🔍 Points de vérification

### Backend Console
```
POST /api/users 201 Created ✅
GET /api/analytics/summary?dateStart=...&dateEnd=... 200 OK ✅
GET /api/analytics/active-sessions 200 OK ✅
```

### Frontend Console
```
✅ NO 404 errors
✅ NO 500 errors
✅ NO undefined references
✅ Analytics data loaded correctly
```

### Database (via psql)
```sql
-- Vérifier les données de test
SELECT COUNT(*) FROM orders;           -- Should be 10
SELECT SUM(total_amount) FROM orders;  -- Should be ~134000
SELECT COUNT(*) FROM cashier_sessions WHERE status = 'OPEN'; -- Should be 3
```

---

## ✅ Test Results Template

```
Test Case #1: Password Validation - Too Short
[ ] Pass / [ ] Fail
Notes: 

Test Case #2: Analytics Page Loading
[ ] Pass / [ ] Fail
Notes:

Test Case #3: Create Valid User
[ ] Pass / [ ] Fail
Notes:

Test Case #4: Duplicate Email Error
[ ] Pass / ] Fail
Notes:

Overall: [ ] All Pass / [ ] Some Failures
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "An unexpected error occurred" | Check backend logs, ensure validations are returning proper 400 status |
| Sessions showing 0 | Ensure V006 migration ran, check database directly |
| Analytics infinite loader | Check console for 404/500, ensure WebSocket is disabled |
| Backend 500 errors | Check logs for stack traces, verify PasswordValidator is working |

---

## 📊 Success Criteria

✅ ALL tests pass
✅ NO "An unexpected error occurred" messages
✅ Clear, field-specific error messages for validation failures
✅ Analytics page loads with real data
✅ Security settings show real active sessions count
✅ Password validation is strict and user-friendly
