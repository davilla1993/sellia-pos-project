# 🚀 Guide de Déploiement - Sellia POS

## Architecture du Déploiement

Ce projet est configuré en **monorepo** avec :
- ✅ Backend Spring Boot qui sert le frontend Angular compilé
- ✅ Tout sur un seul port (8080)
- ✅ PostgreSQL comme base de données

---

## 📋 Prérequis

- Un VPS Hetzner avec Coolify installé
- Un compte GitHub avec accès au repository
- PostgreSQL (service Coolify recommandé)

---

## 🗄️ PostgreSQL : Service vs Container

### ✅ **Recommandé : Service PostgreSQL sur Coolify**

**Avantages :**
- Backups automatiques
- Persistance garantie
- Monitoring intégré
- Isolation de la base de données
- Mises à jour gérées

**Comment faire :**
1. Dans Coolify, allez dans "Databases"
2. Créez un nouveau PostgreSQL
3. Notez les informations de connexion
4. Utilisez ces informations dans les variables d'environnement

### ⚠️ Alternative : PostgreSQL en Container

Si vous préférez utiliser PostgreSQL en container (via docker-compose) :
- Assurez-vous de configurer les volumes persistants
- Mettez en place une stratégie de backup manuelle

---

## 🔧 Configuration sur Coolify

### Étape 1 : Créer le Service PostgreSQL (Recommandé)

1. **Dans Coolify Dashboard**
   - Allez dans **"Databases"** → **"New Database"**
   - Sélectionnez **PostgreSQL**
   - Configurez :
     - Database Name: `sellia_db`
     - Username: `postgres`
     - Password: (générez un mot de passe fort)
   - Créez la base de données

2. **Notez l'URL de connexion**
   ```
   Format: postgresql://username:password@host:port/database
   ou
   jdbc:postgresql://host:port/database
   ```

### Étape 2 : Déployer l'Application

1. **Créer un nouveau Projet**
   - Dans Coolify, cliquez sur **"New Project"**
   - Sélectionnez **"Git Repository"**

2. **Connecter GitHub**
   - Repository URL: `https://github.com/votre-username/sellia-project`
   - Branch: `master` (ou votre branche principale)

3. **Configuration du Build**
   - **Build Pack**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Port**: `8080`

4. **Variables d'Environnement**

   Dans Coolify, configurez les variables suivantes :

   ```bash
   # Database (utilisez les infos de votre service PostgreSQL Coolify)
   DATABASE_URL=jdbc:postgresql://postgres-service-host:5432/sellia_db
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=votre_mot_de_passe_securise

   # Hibernate
   HIBERNATE_DDL_AUTO=update

   # Application URLs (remplacez par votre domaine)
   APP_SERVER_URL=https://votre-domaine.com
   APP_BASE_URL=https://votre-domaine.com

   # JWT Secret (IMPORTANT: Générez une nouvelle clé !)
   # Commande: openssl rand -base64 64
   JWT_SECRET=VOTRE_NOUVELLE_CLE_SECRETE_ICI
   JWT_ACCESS_TOKEN_EXPIRATION=3600000
   JWT_REFRESH_TOKEN_EXPIRATION=432000000

   # Java Options
   JAVA_OPTS=-Xms512m -Xmx1024m
   ```

5. **Volumes Persistants**

   Configurez un volume pour les uploads :
   - Path dans le container: `/app/uploads`
   - Type: Persistent Volume

6. **Domaine**
   - Configurez votre domaine personnalisé
   - Activez SSL/TLS (Let's Encrypt)

### Étape 3 : Déployer

1. Cliquez sur **"Deploy"**
2. Suivez les logs de build
3. Attendez que le healthcheck passe (peut prendre 1-2 minutes)

---

## 🧪 Test en Local (avant déploiement)

### Option 1 : Avec Docker Compose

```bash
# 1. Créer le fichier .env
cp .env.example .env

# 2. Modifier les variables dans .env

# 3. Lancer les services
docker-compose up --build

# 4. Accéder à l'application
http://localhost:8080
```

### Option 2 : Build Docker seul

```bash
# Build l'image
docker build -t sellia-pos .

# Lancer le container
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:5432/sellia_db \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=password \
  -e JWT_SECRET=your-secret \
  sellia-pos
```

---

## 🔒 Sécurité - Checklist

- [ ] Générer un nouveau `JWT_SECRET` (ne jamais utiliser celui par défaut !)
- [ ] Utiliser un mot de passe fort pour PostgreSQL
- [ ] Activer HTTPS avec SSL/TLS sur Coolify
- [ ] Configurer les CORS correctement dans le backend
- [ ] Changer `HIBERNATE_DDL_AUTO` en `validate` en production (après la première initialisation)
- [ ] Configurer les backups automatiques de la base de données

### Générer un JWT Secret sécurisé

```bash
# Sur Linux/Mac
openssl rand -base64 64

# Sur Windows (PowerShell)
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## 📊 Monitoring et Logs

### Health Check

L'application expose un endpoint health :
```
GET http://votre-domaine.com/actuator/health
```

### Logs sur Coolify

- Accédez aux logs en temps réel dans l'interface Coolify
- Logs persistants disponibles dans les paramètres

---

## 🐛 Troubleshooting

### Problème : Build échoue

**Solution :**
- Vérifiez que `node` et `maven` sont correctement installés dans l'image
- Vérifiez les logs de build dans Coolify
- Assurez-vous que le `Dockerfile` est à la racine du projet

### Problème : Application ne démarre pas

**Solution :**
- Vérifiez les variables d'environnement
- Vérifiez la connexion à PostgreSQL
- Consultez les logs : `DATABASE_URL` doit être correcte

### Problème : Frontend ne charge pas

**Solution :**
- Vérifiez que le build Angular s'est bien passé
- Les fichiers doivent être dans `/app/backend/src/main/resources/static`
- Spring Boot sert automatiquement le contenu de `/static`

### Problème : CORS errors

**Solution :**
- Vérifiez que `APP_BASE_URL` correspond à votre domaine
- Vérifiez la configuration CORS dans le backend Spring Boot

---

## 🔄 Mise à Jour de l'Application

1. **Push vers GitHub**
   ```bash
   git add .
   git commit -m "Update"
   git push origin master
   ```

2. **Sur Coolify**
   - Cliquez sur "Redeploy"
   - Ou activez le déploiement automatique (webhook GitHub)

---

## 📝 Notes Importantes

1. **PostgreSQL Service vs Container**
   - Service Coolify = Meilleure option pour la production
   - Container = Bon pour le développement/test

2. **Volumes**
   - Les uploads sont stockés dans `/app/uploads`
   - Configurez un volume persistant pour ne pas perdre les fichiers

3. **Performance**
   - Le build peut prendre 5-10 minutes (Angular + Maven)
   - Ajustez `JAVA_OPTS` selon les ressources de votre VPS

4. **Première Connexion**
   - Vérifiez s'il y a des données de seed dans le backend
   - Créez le premier utilisateur admin via la base de données si nécessaire

---

## 📞 Support

En cas de problème :
1. Consultez les logs Coolify
2. Vérifiez le health endpoint
3. Testez la connexion PostgreSQL

---

**Bonne chance avec votre déploiement ! 🚀**
