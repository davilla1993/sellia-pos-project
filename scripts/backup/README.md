# Sellia POS - Backup & Recovery

Guide complet pour la sauvegarde et restauration de la base de données Sellia POS.

## Quick Start

```bash
# Rendre les scripts exécutables
chmod +x backup-postgres.sh restore-postgres.sh

# Créer une sauvegarde manuelle
./backup-postgres.sh daily

# Voir le statut des backups
./backup-postgres.sh status
```

## Scripts Disponibles

### backup-postgres.sh

Script de sauvegarde automatisée avec rotation.

```bash
# Sauvegarde quotidienne
./backup-postgres.sh daily

# Sauvegarde hebdomadaire
./backup-postgres.sh weekly

# Sauvegarde mensuelle
./backup-postgres.sh monthly

# Voir le statut
./backup-postgres.sh status
```

### restore-postgres.sh

Script de restauration à partir d'un backup.

```bash
# Restaurer depuis un backup
./restore-postgres.sh /var/backups/sellia/daily/sellia_daily_20240115_020000.sql.gz
```

**Attention** : La restauration supprime toutes les données existantes!

## Configuration

### Variables d'Environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| DATABASE_HOST | localhost | Hôte PostgreSQL |
| DATABASE_PORT | 5432 | Port PostgreSQL |
| DATABASE_NAME | sellia_db | Nom de la base |
| DATABASE_USERNAME | postgres | Utilisateur |
| DATABASE_PASSWORD | changeme | Mot de passe |
| BACKUP_DIR | /var/backups/sellia | Répertoire backups |

### Politique de Rétention

| Type | Rétention | Fréquence suggérée |
|------|-----------|-------------------|
| Daily | 7 jours | Tous les jours à 2h |
| Weekly | 4 semaines | Dimanche à 3h |
| Monthly | 12 mois | 1er du mois à 4h |

## Automatisation avec Cron

Éditez le crontab :

```bash
crontab -e
```

Ajoutez ces lignes :

```cron
# Sellia POS - Backups automatiques
# Variables d'environnement
BACKUP_DIR=/var/backups/sellia
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=sellia_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=votre_mot_de_passe

# Backup quotidien à 2h00
0 2 * * * /chemin/vers/scripts/backup/backup-postgres.sh daily >> /var/log/sellia-backup.log 2>&1

# Backup hebdomadaire le dimanche à 3h00
0 3 * * 0 /chemin/vers/scripts/backup/backup-postgres.sh weekly >> /var/log/sellia-backup.log 2>&1

# Backup mensuel le 1er du mois à 4h00
0 4 1 * * /chemin/vers/scripts/backup/backup-postgres.sh monthly >> /var/log/sellia-backup.log 2>&1
```

## Procédure de Restauration Complète

### 1. Identifier le Backup

```bash
# Lister les backups disponibles
./backup-postgres.sh status

# Ou lister manuellement
ls -lht /var/backups/sellia/*/sellia_*.sql.gz
```

### 2. Arrêter l'Application

```bash
# Docker Compose
docker-compose stop app

# Ou systemd
sudo systemctl stop sellia-app
```

### 3. Restaurer la Base de Données

```bash
./restore-postgres.sh /var/backups/sellia/daily/sellia_daily_20240115_020000.sql.gz
```

Le script va :
1. Demander confirmation
2. Fermer les connexions actives
3. Supprimer la base existante
4. Créer une nouvelle base
5. Restaurer les données
6. Vérifier la restauration

### 4. Restaurer les Fichiers Uploads (si nécessaire)

```bash
# Extraire le backup uploads
tar -xzf /var/backups/sellia/daily/sellia_uploads_20240115_020000.tar.gz -C /app/
```

### 5. Redémarrer l'Application

```bash
# Docker Compose
docker-compose start app

# Ou systemd
sudo systemctl start sellia-app
```

### 6. Vérification

```bash
# Health check
curl http://localhost:8080/actuator/health

# Connexion test
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

## Structure des Backups

```
/var/backups/sellia/
├── daily/
│   ├── sellia_daily_20240115_020000.sql.gz
│   ├── sellia_daily_20240114_020000.sql.gz
│   └── sellia_uploads_20240115_020000.tar.gz
├── weekly/
│   ├── sellia_weekly_20240114_030000.sql.gz
│   └── sellia_weekly_20240107_030000.sql.gz
├── monthly/
│   └── sellia_monthly_20240101_040000.sql.gz
└── backup.log
```

## Monitoring des Backups

### Vérifier les Logs

```bash
# Derniers logs
tail -100 /var/backups/sellia/backup.log

# Rechercher les erreurs
grep -i error /var/backups/sellia/backup.log
```

### Alerte sur Échec

Ajoutez à la fin du crontab :

```bash
# Notification si backup échoue
0 6 * * * /chemin/vers/check-backup.sh || mail -s "Sellia Backup Failed" admin@example.com
```

Script `check-backup.sh` :

```bash
#!/bin/bash
# Vérifie si un backup de moins de 24h existe
find /var/backups/sellia/daily -name "*.sql.gz" -mtime -1 | grep -q . || exit 1
```

## Restauration d'Urgence

En cas de perte totale :

```bash
# 1. Installer PostgreSQL
sudo apt install postgresql-16

# 2. Créer l'utilisateur
sudo -u postgres createuser -P sellia_user

# 3. Restaurer
./restore-postgres.sh /chemin/vers/backup.sql.gz

# 4. Lancer l'application
docker-compose up -d
```

## Bonnes Pratiques

1. **Testez les restaurations** régulièrement (mensuel)
2. **Stockage externe** : Copiez les backups mensuels vers un stockage cloud (S3, GCS)
3. **Chiffrement** : Chiffrez les backups contenant des données sensibles
4. **Monitoring** : Alertez si un backup rate
5. **Documentation** : Notez chaque restauration effectuée

## Dépannage

### Erreur de connexion

```bash
# Vérifier PostgreSQL
pg_isready -h localhost -p 5432 -U postgres

# Vérifier les variables
echo $DATABASE_PASSWORD
```

### Backup vide

```bash
# Vérifier les permissions
ls -la /var/backups/sellia/

# Espace disque
df -h /var/backups
```

### Restauration échoue

```bash
# Décompresser manuellement
gunzip sellia_daily_20240115_020000.sql.gz

# Restaurer en verbose
psql -h localhost -U postgres -d sellia_db -f sellia_daily_20240115_020000.sql
```

## Support

- Documentation : `/docs/TECHNICAL-DOCUMENTATION.md`
- Logs : `/var/backups/sellia/backup.log`
- Health check : `GET /actuator/health`
