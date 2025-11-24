# 🗂️ Gestion de la Rétention des Logs d'Audit

## 📋 Vue d'ensemble

Le système de rétention des logs d'audit permet de **gérer automatiquement** le cycle de vie des logs d'audit pour éviter une croissance exponentielle de la base de données tout en conservant un historique complet.

### Stratégie implémentée : **Archivage + Suppression**

Les logs d'audit sont :
1. ✅ **Conservés 90 jours** en base de données (configurable)
2. ✅ **Archivés en CSV** avant suppression
3. ✅ **Supprimés automatiquement** de la base après archivage
4. ✅ **Toujours disponibles** dans Grafana/Loki pour monitoring temps réel

---

## ⚙️ Configuration

### Fichier `application.yml`

```yaml
audit:
  retention:
    days: 90  # Durée de rétention en base de données
    cron: "0 0 3 * * SUN"  # Exécution tous les dimanches à 3h du matin
  archive:
    enabled: true  # Activer l'archivage avant suppression
    path: "archives/audit-logs"  # Chemin des archives
```

### Paramètres personnalisables

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `audit.retention.days` | 90 | Nombre de jours de rétention en BDD |
| `audit.retention.cron` | `0 0 3 * * SUN` | Planning d'exécution (format cron) |
| `audit.archive.enabled` | `true` | Activer/désactiver l'archivage CSV |
| `audit.archive.path` | `archives/audit-logs` | Dossier de stockage des archives |

### Exemples de configuration cron

```yaml
# Tous les jours à 2h du matin
cron: "0 0 2 * * *"

# Tous les lundis à 3h
cron: "0 0 3 * * MON"

# Premier jour du mois à 1h
cron: "0 0 1 1 * *"

# Toutes les heures
cron: "0 0 * * * *"
```

---

## 🚀 Fonctionnement

### 1. Archivage automatique

**Job planifié** qui s'exécute automatiquement selon le cron configuré :

```java
@Scheduled(cron = "0 0 3 * * SUN")
public void scheduleArchiveAndCleanup()
```

**Processus :**
1. Recherche des logs > 90 jours
2. Export en fichier CSV avec timestamp
3. Suppression des logs archivés de la BDD
4. Logs de l'opération dans la console

**Exemple de fichier généré :**
```
archives/audit-logs/audit_logs_archive_2025-11-23_03-00-00.csv
```

### 2. Archivage manuel

**Endpoint REST** accessible aux administrateurs :

```http
POST /api/audit-logs/retention/archive
Authorization: Bearer <admin_token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Audit logs archived and cleaned up successfully",
  "archivedCount": 1523,
  "deletedCount": 1523,
  "archiveFile": "archives/audit-logs/audit_logs_archive_2025-11-23_14-30-15.csv"
}
```

### 3. Consultation de la configuration

**Endpoint REST** accessible aux administrateurs et auditeurs :

```http
GET /api/audit-logs/retention/config
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "retentionDays": 90,
  "archiveEnabled": true,
  "archivePath": "archives/audit-logs"
}
```

---

## 📊 Format des archives CSV

Les fichiers CSV contiennent toutes les données des logs archivés :

```csv
id,user_email,action,entity_type,entity_id,status,action_date,details,ip_address,user_agent,error_message,created_at,updated_at
1,admin@sellia.com,OPEN_CASHIER_SESSION,CASHIER_SESSION,CS001,SUCCESS,2025-08-15T10:30:00,...
2,caissier1@sellia.com,CLOSE_CASHIER_SESSION,CASHIER_SESSION,CS001,SUCCESS,2025-08-15T18:00:00,...
```

### Lecture des archives

**Excel/LibreOffice :**
- Ouvrir directement le fichier CSV
- Les données sont séparées par des virgules

**PostgreSQL :**
```sql
COPY audit_logs(id, user_email, action, entity_type, ...)
FROM '/path/to/audit_logs_archive_2025-11-23_03-00-00.csv'
DELIMITER ',' CSV HEADER;
```

**Python/Pandas :**
```python
import pandas as pd
df = pd.read_csv('archives/audit-logs/audit_logs_archive_2025-11-23_03-00-00.csv')
```

---

## 🔐 Sécurité et Permissions

### Endpoints protégés

| Endpoint | Rôles autorisés | Description |
|----------|-----------------|-------------|
| `GET /api/audit-logs/retention/config` | ADMIN, AUDITOR | Voir la configuration |
| `POST /api/audit-logs/retention/archive` | ADMIN | Forcer l'archivage manuel |

### Exemple d'utilisation (curl)

```bash
# Obtenir la configuration
curl -X GET http://localhost:8080/api/audit-logs/retention/config \
  -H "Authorization: Bearer <token>"

# Déclencher l'archivage manuel
curl -X POST http://localhost:8080/api/audit-logs/retention/archive \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📈 Surveillance et Logs

### Logs de l'opération

L'application log automatiquement les opérations d'archivage :

```
2025-11-23 03:00:00 - Starting scheduled audit log archiving and cleanup (retention: 90 days)
2025-11-23 03:00:01 - Searching for audit logs older than 2025-08-25T03:00:00
2025-11-23 03:00:02 - Successfully archived 1523 audit logs to archives/audit-logs/audit_logs_archive_2025-11-23_03-00-00.csv
2025-11-23 03:00:03 - Successfully deleted 1523 audit logs from database
2025-11-23 03:00:03 - Scheduled audit log cleanup completed successfully: 1523 archived, 1523 deleted
```

### Vérification post-archivage

**Compter les logs restants :**
```sql
SELECT COUNT(*) FROM audit_logs WHERE deleted = false;
```

**Vérifier l'espace disque des archives :**
```bash
du -sh archives/audit-logs/
```

---

## 🛠️ Gestion des archives

### Organisation recommandée

```
archives/
└── audit-logs/
    ├── 2025/
    │   ├── 08/
    │   │   └── audit_logs_archive_2025-08-20_03-00-00.csv
    │   ├── 09/
    │   │   └── audit_logs_archive_2025-09-03_03-00-00.csv
    │   └── 11/
    │       └── audit_logs_archive_2025-11-23_03-00-00.csv
    └── README.md
```

### Script de réorganisation (optionnel)

```bash
#!/bin/bash
# Organiser les archives par année/mois

cd archives/audit-logs
for file in audit_logs_archive_*.csv; do
    year=$(echo $file | cut -d'_' -f3 | cut -d'-' -f1)
    month=$(echo $file | cut -d'_' -f3 | cut -d'-' -f2)
    mkdir -p $year/$month
    mv $file $year/$month/
done
```

### Sauvegarde et compression

**Compression mensuelle :**
```bash
# Compresser les archives de septembre 2025
tar -czf archives_2025-09.tar.gz archives/audit-logs/2025/09/
```

**Transfert vers stockage externe :**
```bash
# S3 / MinIO
aws s3 cp archives_2025-09.tar.gz s3://sellia-archives/audit-logs/

# Serveur distant
rsync -avz archives/audit-logs/ backup-server:/backups/sellia/audit-logs/
```

---

## 🧪 Tests

### Test manuel de l'archivage

1. **Créer des logs de test anciens** (modifier temporairement les dates en BDD) :
```sql
UPDATE audit_logs
SET action_date = NOW() - INTERVAL '100 days'
WHERE id IN (SELECT id FROM audit_logs LIMIT 10);
```

2. **Déclencher l'archivage via API** :
```bash
curl -X POST http://localhost:8080/api/audit-logs/retention/archive \
  -H "Authorization: Bearer <admin_token>"
```

3. **Vérifier le fichier CSV généré** :
```bash
ls -lh archives/audit-logs/
cat archives/audit-logs/audit_logs_archive_*.csv
```

4. **Vérifier la suppression en BDD** :
```sql
SELECT COUNT(*) FROM audit_logs WHERE action_date < NOW() - INTERVAL '90 days';
-- Devrait retourner 0
```

---

## ⚠️ Considérations importantes

### Performance

- ✅ L'archivage s'exécute en **dehors des heures de pointe** (3h du matin par défaut)
- ✅ Utilise une **transaction** pour garantir la cohérence
- ✅ Les index sur `action_date` optimisent les recherches

### Conformité légale

- 📋 **RGPD** : Les logs d'audit peuvent contenir des données personnelles
- 📋 **Durée de conservation** : Vérifier les obligations légales de votre secteur
- 📋 **Traçabilité** : Les archives CSV permettent l'audit historique

### Restauration

Pour restaurer des logs archivés dans la base de données :

```sql
-- 1. Créer une table temporaire
CREATE TABLE audit_logs_restore AS SELECT * FROM audit_logs LIMIT 0;

-- 2. Importer le CSV
COPY audit_logs_restore FROM '/path/to/archive.csv' DELIMITER ',' CSV HEADER;

-- 3. Insérer dans la table principale (attention aux IDs)
INSERT INTO audit_logs SELECT * FROM audit_logs_restore;
```

---

## 🎯 Résumé

| Aspect | Détail |
|--------|--------|
| **Rétention** | 90 jours en BDD (configurable) |
| **Fréquence** | Tous les dimanches à 3h du matin |
| **Archivage** | CSV avec timestamp |
| **Localisation** | `archives/audit-logs/` |
| **Accès manuel** | API REST (ADMIN uniquement) |
| **Monitoring** | Logs dans console + Grafana/Loki |

---

## 📞 Support

Pour toute question ou problème :
- Consulter les logs de l'application
- Vérifier la configuration dans `application.yml`
- Contacter l'équipe technique
