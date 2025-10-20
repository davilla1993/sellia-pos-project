# ⏸️ Monitoring - Temporairement désactivé

Le monitoring complet (Prometheus, Loki, Grafana) a été **désactivé** pour se concentrer sur l'application métier.

## 📊 Pourquoi désactivé?

- ✅ Erreurs Loki au démarrage
- ✅ Trop de services à gérer en même temps
- ✅ Besoin de tester les fonctionnalités métier d'abord
- ✅ Ajoutera plus tard une fois l'appli stable

## 🚀 Démarrer maintenant (sans monitoring)

```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Services:
- ✅ PostgreSQL
- ✅ Backend (Spring Boot)
- ✅ Frontend (Angular)

---

## 🔄 Réactiver le monitoring plus tard

Quand vous serez prêt à réactiver:

### Étape 1: Réinstaller les dépendances
```bash
# Dans sellia-backend/pom.xml, retirer le commentaire:
# - io.micrometer / micrometer-registry-prometheus
# - com.github.loki4j / loki-logback-appender
```

### Étape 2: Utiliser le docker-compose complet
```bash
# Au lieu de:
docker-compose -f docker-compose.simple.yml up -d

# Utiliser:
docker-compose up -d
```

### Étape 3: Accéder à Grafana
```
http://localhost:3001
Username: admin
Password: admin
```

---

## 📁 Fichiers de monitoring (conservés)

Tous les fichiers de monitoring sont **conservés** dans le repo:

```
✅ docker-compose.yml           # Version complète avec monitoring
✅ MONITORING.md                # Documentation complète
✅ monitoring/                  # Config Prometheus, Loki, Grafana
✅ sellia-backend/src/main/resources/logback-spring.xml
✅ monitoring/start-monitoring.sh
✅ monitoring/start-monitoring.ps1
```

---

## 🎯 Code métier

Maintenant, concentrez-vous sur:
- ✅ Tester toutes les fonctionnalités de l'app
- ✅ Corriger les bugs
- ✅ Implémenter les features manquantes
- ✅ Tests unitaires
- ✅ Optimisations

---

## 📚 Documentation

- **Démarrage simple:** [`START_SIMPLE.md`](./START_SIMPLE.md)
- **Monitoring complet:** [`MONITORING.md`](./MONITORING.md)
- **Setup monitoring:** [`MONITORING_SETUP_SUMMARY.md`](./MONITORING_SETUP_SUMMARY.md)

---

## 🔧 Reverting (réactiver monitoring)

Pour réactiver le monitoring complet:

```bash
# 1. Reconstituer les dépendances pom.xml
git show HEAD~1:sellia-backend/pom.xml > temp.pom
# Copier les dépendances de monitoring

# 2. Utiliser docker-compose complet
docker-compose down -v
docker-compose up -d

# 3. Accéder à Grafana
http://localhost:3001
```

---

**À bientôt, monitoring! 👋**

Pour l'instant: `docker-compose -f docker-compose.simple.yml up -d` 🚀
