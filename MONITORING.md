# Monitoring Stack - Sellia POS

Documentation complète du monitoring avec Prometheus, Loki et Grafana.

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sellia POS Application                   │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Backend         │         │  Frontend        │          │
│  │  (Spring Boot)   │         │  (Angular)       │          │
│  │  :8080           │         │  :3000           │          │
│  └────────┬─────────┘         └──────────────────┘          │
└───────────┼────────────────────────────────────────────────┘
            │
            ├─────────────────┬─────────────────┐
            │                 │                 │
        Metrics          Logs (Loki)       Health
      (/actuator/       (Logback)          (/actuator/
     prometheus)       (push)              health)
            │                 │                 │
┌───────────▼─────────┐  ┌────▼────────┐  ┌────▼────────┐
│   Prometheus        │  │    Loki     │  │  Node       │
│   :9090             │  │    :3100    │  │  Exporter   │
│   (Metrics Store)   │  │ (Log Store) │  │  :9100      │
└───────────┬─────────┘  └────┬────────┘  │             │
            │                 │           └─────────────┘
            └─────────────────┴───────────────────┘
                        │
            ┌───────────▼──────────┐
            │      Grafana         │
            │      :3001           │
            │ (Visualization)      │
            └──────────────────────┘
```

## 🚀 Démarrage de la Stack

### Prérequis
- Docker & Docker Compose
- Environ 4GB de RAM disponible

### Commandes

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Arrêter
docker-compose down

# Arrêter avec suppression des volumes (reset complet)
docker-compose down -v
```

### Accès aux services

| Service       | URL                  | User/Pass      |
|---------------|----------------------|----------------|
| Backend       | http://localhost:8080 | -              |
| Frontend      | http://localhost:3000 | -              |
| Prometheus    | http://localhost:9090 | -              |
| Loki          | http://localhost:3100 | -              |
| Grafana       | http://localhost:3001 | admin / admin  |

## 📈 Prometheus

### Configuration
- **Fichier:** `monitoring/prometheus/prometheus.yml`
- **Scrape interval:** 15 secondes
- **Rétention:** 15 jours
- **Alertes:** `monitoring/prometheus/alerts.yml`

### Métriques collectées

#### Backend (Spring Boot)
```
- HTTP requests (count, duration, status)
- JVM Heap/Non-Heap memory
- GC Activity
- Thread count
- Database connections (HikariCP)
- Application health
```

#### Système (Node Exporter)
```
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- System load
```

### Consulter les métriques

1. Ouvrir http://localhost:9090
2. Exemples de queries:

```promql
# CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTP requests par seconde
rate(http_server_requests_seconds_count[5m])

# JVM Heap memory usage
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# Error rate (5xx)
(sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m]))) * 100
```

## 🔍 Loki

### Configuration
- **Fichier:** `monitoring/loki/loki-config.yml`
- **Rétention:** 30 jours
- **Max lines:** 1000 par requête
- **Storage:** Fichiers locaux (`/loki/chunks`)

### Logs captés

**Backend:**
- Application logs (tous les niveaux)
- Spring logs
- Hibernate logs
- Labels: `app`, `version`, `host`, `level`

### Consulter les logs

Via Grafana -> Logs Dashboard ou Loki API:

```bash
# Tous les logs de l'app
curl http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={app="sellia-api"}'

# Logs d'erreurs seulement
curl http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={app="sellia-api"} | "ERROR"'
```

## 📊 Grafana

### Accès
- **URL:** http://localhost:3001
- **Admin:** admin / admin
- **Change le mot de passe au premier login!**

### Dashboards pré-configurés

#### 1. System Metrics
- CPU, Memory, Disk usage
- Backend service status
- Seuils d'alerte visuels

#### 2. Application Metrics
- HTTP requests/sec
- Response time (p95)
- Error rate (5xx)
- JVM Heap memory
- JVM Threads
- GC Activity

#### 3. Logs Dashboard
- Error count timeline
- Log level distribution
- Top applications by volume
- Recent errors table

### Data Sources

**Prometheus** (Métriques)
- URL: http://prometheus:9090
- Scrape interval: 15s

**Loki** (Logs)
- URL: http://loki:3100
- Max lines: 1000

### Créer un dashboard custom

1. Grafana → + → Dashboard
2. Add panel → Choisir data source (Prometheus ou Loki)
3. Écrire la query PromQL ou LogQL
4. Configurer visualisation
5. Save

Exemple PromQL:
```
sum by (status) (rate(http_server_requests_seconds_count[5m]))
```

Exemple LogQL:
```
{app="sellia-api"} | json | severity="ERROR"
```

## 🚨 Alertes

### Alertes configurées

**Critical:**
- Backend down (1 minute)
- Loki down (1 minute)
- Disk usage > 90%

**Warning:**
- CPU > 80% (5 minutes)
- Memory > 85% (5 minutes)
- DB connections > 80% (5 minutes)
- HTTP error rate > 5% (5 minutes)
- JVM Heap > 85% (5 minutes)

### Configurer les notifications

Dans Grafana:
1. Alerting → Notification channels
2. Ajouter un channel (email, Slack, webhook, etc.)
3. Configurer les rules pour utiliser ce channel

Fichier: `monitoring/prometheus/alerts.yml`

## 🔧 Configuration Backend

### Spring Boot

**application.yml:**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: always
  metrics:
    enable:
      jvm: true
      process: true
      system: true
      logback: true
```

**Endpoints actuator:**
- `/actuator/health` - Health check
- `/actuator/metrics` - Lister les métriques
- `/actuator/prometheus` - Métriques Prometheus

### Logs (Logback)

**logback-spring.xml:**
- Console appender (local)
- Loki appender (prod)
- Labels: app, version, host, level
- Retry auto + batch send

**Configuration Loki:**
```xml
<http>
  <url>http://loki:3100/loki/api/v1/push</url>
</http>
<batchSize>100</batchSize>
<batchTimeoutMs>5000</batchTimeoutMs>
```

## 📝 Queries utiles

### PromQL

```promql
# Latence moyenne des requests
avg(rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m]))

# Top 10 endpoints par error rate
topk(10, sum by (uri) (rate(http_server_requests_seconds_count{status=~"5.."}[5m])))

# Memory trend
jvm_memory_used_bytes{area="heap"}

# Request count par method
sum by (method) (rate(http_server_requests_seconds_count[5m]))

# Health status
up{job="sellia-backend"}
```

### LogQL

```logql
# Count erreurs par host
sum by (host) (count_over_time({level="ERROR"}[5m]))

# Logs contenant "timeout"
{app="sellia-api"} |= "timeout"

# Performance logs
{app="sellia-api"} | duration > 1000

# Exception stack traces
{app="sellia-api"} |= "Exception" | "at "
```

## 🐳 Docker Compose Services

| Service       | Image                         | Port   | Volume               |
|---------------|-------------------------------|--------|----------------------|
| postgres      | postgres:16-alpine            | 5432   | postgres_data        |
| sellia-backend| custom (Dockerfile)           | 8080   | uploads              |
| sellia-app    | custom (Dockerfile)           | 3000   | -                    |
| prometheus    | prom/prometheus:latest        | 9090   | prometheus_data      |
| loki          | grafana/loki:latest           | 3100   | loki_data            |
| node-exporter | prom/node-exporter:latest     | 9100   | /proc, /sys, /       |
| grafana       | grafana/grafana:latest        | 3001   | grafana_data         |

## 📊 Performance Tips

### Prometheus
- Augmenter `--storage.tsdb.retention.time` pour plus d'historique
- Réduire `scrape_interval` pour plus de granularité (attention: plus de storage)
- Utiliser des recording rules pour les queries complexes

### Loki
- Augmenter `chunk_target_size` pour moins d'I/O disk
- Réduire `retention_period` pour moins de storage
- Configurer sharding pour multi-tenant

### Grafana
- Utiliser des intervals variables ($__interval)
- Limiter la plage de temps avec `max_data_points`
- Cacher les dashboards rarement utilisés

## 🆘 Troubleshooting

### Backend ne se connecte pas à Loki
```bash
# Vérifier la connectivité
docker-compose exec sellia-backend curl -i http://loki:3100/ready

# Voir les logs
docker-compose logs loki
```

### Prometheus ne scrape pas les métriques
```bash
# Vérifier la config
docker-compose exec prometheus cat /etc/prometheus/prometheus.yml

# Voir les targets
curl http://localhost:9090/api/v1/targets

# Logs
docker-compose logs prometheus
```

### Grafana ne voit pas les data sources
```bash
# Vérifier les data sources
curl http://localhost:3001/api/datasources

# Vérifier la connectivité
docker-compose exec grafana curl http://prometheus:9090/-/healthy
docker-compose exec grafana curl http://loki:3100/ready
```

### Disque plein
```bash
# Nettoyer les données anciennes
docker-compose down -v

# Ou augmenter la rétention
docker-compose down

# Modifier retention dans prometheus.yml
docker-compose up -d
```

## 🔐 Sécurité

### Production checklist

- [ ] Changer le mot de passe admin Grafana
- [ ] Activer l'authentification dans Prometheus
- [ ] Utiliser des volumes persistants chiffrés
- [ ] Configurer un reverse proxy (nginx)
- [ ] Ajouter SSL/TLS
- [ ] Limiter l'accès aux ports (firewall)
- [ ] Mettre à jour les images Docker régulièrement

## 📚 Resources

- [Prometheus Docs](https://prometheus.io/docs/)
- [Loki Docs](https://grafana.com/docs/loki/)
- [Grafana Docs](https://grafana.com/docs/grafana/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Docs](https://grafana.com/docs/loki/latest/logql/)

## 🎯 Prochaines étapes

1. ✅ Setup monitoring stack
2. 📝 Créer des dashboards custom par métier
3. 🚨 Configurer des alertes Slack/Email
4. 📊 Configurer les recording rules Prometheus
5. 🔐 Sécuriser l'accès au monitoring
6. 📈 Optimiser la rétention des données
