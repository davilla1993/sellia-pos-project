# Migration des Audit Logs - Usernames vers Emails

## Contexte
Les logs d'audit stockaient les **usernames** dans la colonne `user_email`. Ce script corrige cela en remplaçant les usernames par les **emails complets**.

## Changements appliqués
| Avant (username) | Après (email) |
|------------------|---------------|
| admin | admin@sellia.com |
| caissier1 | caissier1@sellia.com |
| caissier2 | caissier2@sellia.com |
| bar | barman@sellia.com |

---

## 📋 Option 1: Script avec Transaction (Recommandé)

**Fichier:** `migrate_audit_logs_usernames_to_emails.sql`

### Avantages
- ✅ Sécurisé: vous pouvez annuler avec `ROLLBACK`
- ✅ Affiche les statistiques avant/après
- ✅ Compte les lignes modifiées

### Utilisation

#### Via ligne de commande MySQL:
```bash
mysql -u root -p sellia < scripts/migrate_audit_logs_usernames_to_emails.sql
```

#### Via client MySQL (Workbench, DBeaver, etc.):
1. Ouvrez le fichier `migrate_audit_logs_usernames_to_emails.sql`
2. Exécutez tout le script
3. **Vérifiez** les résultats affichés
4. Si tout est correct:
   - Décommentez `COMMIT;` et exécutez-le
5. Si quelque chose ne va pas:
   - Décommentez `ROLLBACK;` et exécutez-le

---

## 🚀 Option 2: Script Simple (Rapide)

**Fichier:** `migrate_audit_logs_simple.sql`

### Avantages
- ⚡ Rapide et direct
- Simple à exécuter

### ⚠️ Attention
- Pas de transaction (changements immédiats)
- Pas de possibilité d'annulation

### Utilisation
```bash
mysql -u root -p sellia < scripts/migrate_audit_logs_simple.sql
```

---

## 🔍 Vérification manuelle

Après la migration, vérifiez que tout est correct:

```sql
-- Compter les logs par email
SELECT user_email, COUNT(*) as total
FROM audit_logs
GROUP BY user_email
ORDER BY total DESC;

-- Afficher les 10 derniers logs
SELECT user_email, action, entity_type, action_date
FROM audit_logs
ORDER BY action_date DESC
LIMIT 10;
```

---

## 📊 Résultats attendus

Basé sur vos données actuelles (145 logs):
- **caissier1@sellia.com**: 102 logs
- **caissier2@sellia.com**: 34 logs
- **admin@sellia.com**: 9 logs
- **barman@sellia.com**: 0 logs (si 'bar' n'existe pas encore)

---

## ⚠️ Sauvegarde recommandée

Avant d'exécuter le script, faites une sauvegarde:

```bash
mysqldump -u root -p sellia audit_logs > backup_audit_logs_before_migration.sql
```

Pour restaurer en cas de problème:
```bash
mysql -u root -p sellia < backup_audit_logs_before_migration.sql
```

---

## 🎯 Impact

### Avant
```
user_email: "admin"
user_email: "caissier1"
```

### Après
```
user_email: "admin@sellia.com"
user_email: "caissier1@sellia.com"
```

Le dashboard d'audit affichera maintenant des emails professionnels au lieu de simples usernames.
