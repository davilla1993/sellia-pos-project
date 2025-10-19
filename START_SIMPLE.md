# 🚀 Démarrage Rapide - Sellia POS (Sans Monitoring)

**Commande unique:**

```bash
cd D:\Fullstack-projects\sellia-project
docker-compose -f docker-compose.simple.yml up -d
```

---

## 📊 Services lancés

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:8080 | 8080 |
| Database | localhost | 5432 |

---

## ✅ Vérifier que ça marche

```bash
# Voir les services
docker-compose -f docker-compose.simple.yml ps

# Attendre 30 secondes, puis tester
curl http://localhost:8080/actuator/health
```

---

## 🌐 Accès

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8080/api
3. **Health check:** http://localhost:8080/actuator/health

---

## 📝 Login par défaut

```
Username: admin
Password: Admin@123
```

---

## 📊 Logs en temps réel

```bash
docker-compose -f docker-compose.simple.yml logs -f
```

---

## 🛑 Arrêter

```bash
docker-compose -f docker-compose.simple.yml down
```

**Avec suppression des données:**
```bash
docker-compose -f docker-compose.simple.yml down -v
```

---

## 🔄 Redémarrer un service

```bash
docker-compose -f docker-compose.simple.yml restart sellia-backend
```

---

## 📂 Structure

```
3 services seulement:
✅ PostgreSQL (Database)
✅ Spring Boot Backend
✅ Angular Frontend
```

**Monitoring désactivé pour l'instant. On y reviendra plus tard.**

---

## ⏱️ Temps de démarrage

- **Postgres:** ~5 secondes
- **Backend:** ~15 secondes
- **Frontend:** ~10 secondes
- **Total:** ~30 secondes

---

**Prêt? C'est parti!**
```bash
docker-compose -f docker-compose.simple.yml up -d
```
