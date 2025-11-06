# Guide de Déploiement Sellia POS sur Coolify

Ce guide vous explique comment déployer Sellia POS (monorepo) sur Coolify avec Hetzner.

## Architecture

Le projet est organisé en **monorepo** avec :
- **Backend** : Spring Boot (Java 21) dans `sellia-backend/`
- **Frontend** : Angular avec Nginx dans `sellia-app/`
- **Base de données** : PostgreSQL 16

Tout est déployé en un seul bloc via `docker-compose.prod.yml`.

## Prérequis

- VPS Hetzner avec Coolify installé
- Nom de domaine configuré (ex: `sellia.votredomaine.com`)
- Accès SSH au VPS

## Étape 1 : Configuration des Variables d'Environnement

Dans Coolify, créez un nouveau projet et configurez les variables d'environnement suivantes :

### Variables Obligatoires

```bash
# Base de données
DATABASE_NAME=sellia_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=VotreMotDePasseSecurise123!

# URLs publiques
APP_SERVER_URL=https://api.votredomaine.com
APP_BASE_URL=https://votredomaine.com

# Sécurité JWT (IMPORTANT: générez une clé forte)
JWT_SECRET=VotreCleSecrete64CaracteresMinimum
```

### Générer une clé JWT sécurisée

Sur votre machine locale ou le serveur :

```bash
openssl rand -base64 64
```

Copiez le résultat dans `JWT_SECRET`.

### Variables Optionnelles

```bash
# Ports (par défaut)
BACKEND_PORT=8080
FRONTEND_PORT=80

# Mémoire Java
JAVA_MAX_HEAP=512m
JAVA_MIN_HEAP=256m

# Configuration Hibernate
HIBERNATE_DDL_AUTO=update

# Durée des tokens JWT
JWT_ACCESS_TOKEN_EXPIRATION=3600000      # 1 heure
JWT_REFRESH_TOKEN_EXPIRATION=432000000   # 5 jours
```

## Étape 2 : Configuration Coolify

### 2.1 Créer une nouvelle application

1. Dans Coolify, cliquez sur **"New Resource"**
2. Sélectionnez **"Docker Compose"**
3. Connectez votre repository GitHub
4. Branche : `main` (ou votre branche de production)

### 2.2 Configuration du Docker Compose

- **Docker Compose File** : `docker-compose.prod.yml`
- **Build Method** : Docker Compose

### 2.3 Configuration des domaines

Configurez 2 domaines dans Coolify :

1. **Backend** (API) :
   - Domaine : `api.votredomaine.com`
   - Port interne : `8080`
   - Service : `backend`

2. **Frontend** :
   - Domaine : `votredomaine.com`
   - Port interne : `80`
   - Service : `frontend`

### 2.4 Configuration SSL

Coolify génère automatiquement les certificats SSL via Let's Encrypt. Assurez-vous que :
- Vos domaines pointent vers l'IP du VPS
- Les ports 80 et 443 sont ouverts

## Étape 3 : Configuration des Volumes

Coolify gère automatiquement les volumes Docker, mais vérifiez que ces volumes sont bien créés :

- `postgres_data` : Données PostgreSQL persistantes
- `backend_uploads` : Fichiers uploadés (images produits, QR codes, reçus)
- `backend_logs` : Logs de l'application

## Étape 4 : Déploiement

1. **Déployez l'application** via Coolify
2. **Surveillez les logs** de chaque service
3. **Vérifiez la santé** des services :
   - Backend : `https://api.votredomaine.com/actuator/health`
   - Frontend : `https://votredomaine.com/health`

## Étape 5 : Vérification Post-Déploiement

### 5.1 Vérifier la base de données

```bash
# Connectez-vous au conteneur PostgreSQL
docker exec -it sellia-postgres psql -U postgres -d sellia_db

# Listez les tables
\dt

# Quittez
\q
```

### 5.2 Vérifier les logs

```bash
# Backend
docker logs sellia-backend -f

# Frontend
docker logs sellia-frontend -f

# Base de données
docker logs sellia-postgres -f
```

### 5.3 Tester l'application

1. Accédez à `https://votredomaine.com`
2. Vérifiez que la page se charge correctement
3. Testez la connexion (créez un compte ou connectez-vous)

## Structure des Fichiers de Configuration

```
sellia-pos-project/
├── docker-compose.prod.yml          # Configuration production Coolify
├── .env.example                     # Template variables d'environnement
├── sellia-backend/
│   ├── Dockerfile                   # Build multi-stage backend
│   └── src/main/resources/
│       ├── application.yml          # Config commune
│       ├── application-dev.yml      # Config dev (PostgreSQL)
│       └── application-prod.yml     # Config prod (PostgreSQL)
└── sellia-app/
    └── Dockerfile                   # Build multi-stage frontend + Nginx
```

## Profils Spring Boot

Le backend utilise des profils Spring :

- **dev** : Développement local (PostgreSQL local)
- **prod** : Production (PostgreSQL dans Docker)

Le profil actif est contrôlé par `SPRING_PROFILES_ACTIVE=prod` dans docker-compose.

## Sauvegardes

### Sauvegarde manuelle de la base de données

```bash
# Créer une sauvegarde
docker exec sellia-postgres pg_dump -U postgres sellia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer une sauvegarde
docker exec -i sellia-postgres psql -U postgres sellia_db < backup_20241105_120000.sql
```

### Sauvegarde automatique (Coolify)

Configurez les sauvegardes automatiques dans Coolify :
1. Allez dans **Settings** > **Backups**
2. Activez les sauvegardes quotidiennes
3. Choisissez la rétention (ex: 7 jours)

## Mise à jour de l'application

1. Pousser vos modifications sur GitHub
2. Dans Coolify, cliquez sur **"Redeploy"**
3. Coolify va automatiquement :
   - Pull les dernières modifications
   - Rebuild les images Docker
   - Redéployer l'application avec zero-downtime

## Monitoring

### Health Checks

- Backend : `https://api.votredomaine.com/actuator/health`
- Métriques : `https://api.votredomaine.com/actuator/metrics`
- Info : `https://api.votredomaine.com/actuator/info`

### Logs en temps réel

Dans Coolify, accédez à la section **Logs** pour voir les logs en temps réel de chaque service.

## Dépannage

### Le backend ne démarre pas

1. Vérifiez les logs : `docker logs sellia-backend`
2. Vérifiez les variables d'environnement dans Coolify
3. Vérifiez que PostgreSQL est démarré et accessible

### La base de données ne se connecte pas

1. Vérifiez que `DATABASE_PASSWORD` est défini
2. Vérifiez que le service postgres est healthy : `docker ps`
3. Testez la connexion : `docker exec sellia-postgres pg_isready`

### Le frontend ne charge pas

1. Vérifiez que le backend est accessible
2. Vérifiez la configuration nginx dans `sellia-app/Dockerfile`
3. Vérifiez les logs : `docker logs sellia-frontend`

### Erreur 502 Bad Gateway

- Le backend n'est pas encore démarré (temps de démarrage ~30-60s)
- Attendez que le healthcheck passe au vert

## Support

Pour toute question ou problème, consultez :
- [Documentation Coolify](https://coolify.io/docs)
- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Docker](https://docs.docker.com/)

## Sécurité

### Checklist de sécurité

- [ ] JWT_SECRET changé et sécurisé (64+ caractères)
- [ ] DATABASE_PASSWORD fort et unique
- [ ] SSL/TLS activé sur les deux domaines
- [ ] Firewall configuré (ports 80, 443, 22 uniquement)
- [ ] Mises à jour système régulières
- [ ] Sauvegardes automatiques configurées
- [ ] Variables sensibles dans Coolify (pas dans le code)

## Performance

### Recommandations VPS Hetzner

- **Minimum** : CX21 (2 vCPU, 4 GB RAM)
- **Recommandé** : CX31 (2 vCPU, 8 GB RAM)
- **Production** : CX41 (4 vCPU, 16 GB RAM)

### Optimisations

- Ajustez `JAVA_MAX_HEAP` selon la RAM disponible
- Activez le cache Redis si beaucoup de trafic
- Configurez un CDN pour les assets statiques