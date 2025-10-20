# 📊 Sellia POS - Monitoring Stack Setup Summary

## ✅ Implémentation complète - Prometheus, Loki & Grafana

### 🎯 Objectif
Ajouter un monitoring complet et un système de logs centralisé pour tracer les performance, erreurs et comportements de l'application.

---

## 📦 Composants installés

### 1. **Backend Integration (Spring Boot)**

#### Dépendances Maven ajoutées:
```xml
✅ spring-boot-starter-actuator       # Expose health & metrics
✅ micrometer-registry-prometheus     # Prometheus metrics export
✅ loki-logback-appender              # Push logs to Loki
```

#### Configuration (`application.yml`):
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
      base-path: /actuator
  metrics:
    enable:
      jvm: true
      process: true
      system: true
      logback: true
```

#### Endpoints disponibles:
- `GET /actuator/health` - Health check avec détails
- `GET /actuator/metrics` - Liste des métriques disponibles
- `GET /actuator/prometheus` - Métriques au format Prometheus

---

### 2. **Logging with Loki**

#### Fichier: `logback-spring.xml`
- **Console Appender:** Logs en local (development)
- **Loki Appender:** Push logs à Loki (production)
- **Labels:** app, version, host, level
- **Batch:** 100 logs par 5 secondes

#### Configuration Loki:
- **Rétention:** 30 jours
- **Storage:** Filesystem local (/loki/chunks)
- **Max ingestion:** 100 MB/s
- **Burst:** 150 MB/s

---

### 3. **Prometheus Configuration**

#### Fichier: `monitoring/prometheus/prometheus.yml`

**Scrape Jobs:**
- **sellia-backend** (8080/actuator/prometheus) - Métriques de l'app
- **node-exporter** (9100) - Métriques système
- **prometheus** (9090) - Self-monitoring
- **loki** (3100) - Loki health

**Configuration:**
- Scrape interval: 15 secondes
- Rétention: 15 jours
- Alertes: `prometheus/alerts.yml`

#### Alertes pré-configurées:
```yaml
CRITICAL:
  ✅ Backend Down (1 min)
  ✅ Loki Down (1 min)
  ✅ Disk > 90%

WARNING:
  ✅ CPU > 80% (5 min)
  ✅ Memory > 85% (5 min)
  ✅ DB Connections > 80% (5 min)
  ✅ Error Rate > 5% (5 min)
  ✅ JVM Heap > 85% (5 min)
```

---

### 4. **Grafana Dashboards**

#### Fichier: `monitoring/grafana/provisioning/dashboards/`

**Dashboard 1: System Metrics**
- CPU Usage (%)
- Memory Usage (%)
- Disk Usage (%)
- Backend Service Status

**Dashboard 2: Application Metrics**
- HTTP Requests/sec
- Response Time (p95)
- Error Rate (5xx errors)
- JVM Heap Memory
- JVM Threads
- GC Activity

**Dashboard 3: Logs Dashboard**
- Error Logs Count Timeline
- Log Level Distribution
- Top Applications by Volume
- Recent Errors Table

#### Data Sources:
✅ Prometheus (http://prometheus:9090)
✅ Loki (http://loki:3100)

---

### 5. **Docker Stack**

#### Services déployés:

```yaml
postgres          # Database (5432)
sellia-backend    # API (8080)
sellia-app        # Frontend (3000)
prometheus        # Metrics (9090)
loki              # Logs (3100)
node-exporter     # System metrics (9100)
grafana           # Dashboard (3001)
```

#### Dockerfiles:

**Backend:** Multi-stage build
- Maven builder stage
- Java runtime stage (21-jre-alpine)
- Health checks intégrés

**Frontend:** Multi-stage build
- Node builder stage
- Nginx server stage
- Proxy vers backend (/api, /ws)
- Health checks intégrés

---

## 🚀 Utilisation

### Démarrer le stack:

**Windows:**
```powershell
cd monitoring
./start-monitoring.ps1
```

**Linux/Mac:**
```bash
cd monitoring
chmod +x start-monitoring.sh
./start-monitoring.sh
```

**Ou directement:**
```bash
docker-compose up -d
```

### Accès aux services:

| Service    | URL                  | Credentials    |
|-----------|----------------------|----------------|
| Frontend   | http://localhost:3000 | -              |
| Backend    | http://localhost:8080 | -              |
| Prometheus | http://localhost:9090 | -              |
| Loki       | http://localhost:3100 | -              |
| **Grafana**| **http://localhost:3001** | **admin/admin** |

### Premières étapes:

1. **Démarrer:** `docker-compose up -d`
2. **Attendre:** 30 secondes (services warming up)
3. **Grafana:** http://localhost:3001
4. **Login:** admin / admin
5. **Changer le mot de passe** (recommandé)
6. **Voir les dashboards:**
   - System Metrics
   - Application Metrics
   - Logs Dashboard

---

## 📈 Métriques collectées

### Backend (via Micrometer/Prometheus)

```
✅ HTTP Server Metrics
   - Requests count by method/path/status
   - Request duration (histogram)
   - Response time percentiles

✅ JVM Metrics
   - Heap memory used/max
   - Non-heap memory
   - Thread count (live/peak)
   - Garbage collection pauses

✅ Application Health
   - Overall status
   - Component status (DB, etc.)
   - Response time
```

### Système (via Node Exporter)

```
✅ CPU
   - Usage percentage
   - Load average
   - Per-core metrics

✅ Memory
   - Total/Available/Used
   - Cache/Buffers
   - Swap usage

✅ Disk
   - Space used/available
   - I/O throughput
   - Read/write latency

✅ Network
   - Bytes in/out
   - Packets in/out
   - Errors/dropped
```

### Logs (via Loki/Logback)

```
✅ Centralized
   - All application logs
   - All levels (DEBUG/INFO/WARN/ERROR)
   - Full-text searchable

✅ Labeled
   - app: Application name
   - version: Build version
   - host: Server hostname
   - level: Log level
```

---

## 🔍 Example Queries

### Prometheus (PromQL)

```promql
# CPU Usage %
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTP Requests/sec
rate(http_server_requests_seconds_count[5m])

# Error Rate %
(sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / 
 sum(rate(http_server_requests_seconds_count[5m]))) * 100

# JVM Heap Usage %
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# Database Connection Pool Usage
(hikaricp_connections_active / hikaricp_connections) * 100
```

### Loki (LogQL)

```logql
# All ERROR logs
{app="sellia-api"} |= "ERROR"

# Errors in specific time range
{app="sellia-api"} |= "ERROR" | level="ERROR"

# Count errors per hour
sum by (app) (count_over_time({app="sellia-api"} |= "ERROR" [1h]))

# Logs with duration > 1000ms
{app="sellia-api"} | duration > 1000
```

---

## 📊 Performance Monitoring

### Key Metrics to Watch:

**Application Performance:**
- ✅ HTTP Response Time (p95) - Target < 500ms
- ✅ Error Rate - Target < 1%
- ✅ Requests/sec - Monitor for scaling needs

**System Health:**
- ✅ CPU Usage - Alert if > 80%
- ✅ Memory Usage - Alert if > 85%
- ✅ Disk Usage - Alert if > 90%

**Database:**
- ✅ Connection Pool - Alert if > 80%
- ✅ Query Time - Monitor slow queries
- ✅ Connection Count - Track connections

**JVM:**
- ✅ Heap Usage - Alert if > 85%
- ✅ GC Pause Time - Monitor for issues
- ✅ Thread Count - Monitor for leaks

---

## 📝 Files Created/Modified

### New Files:
```
✅ docker-compose.yml                          # Full stack orchestration
✅ .env.example                                # Environment variables template
✅ MONITORING.md                               # Full monitoring documentation
✅ MONITORING_SETUP_SUMMARY.md                 # This file
✅ monitoring/prometheus/prometheus.yml        # Prometheus config
✅ monitoring/prometheus/alerts.yml            # Alert rules
✅ monitoring/loki/loki-config.yml            # Loki config
✅ monitoring/grafana/provisioning/...        # Grafana setup
✅ monitoring/README.md                        # Monitoring quick start
✅ monitoring/start-monitoring.sh              # Linux/Mac startup script
✅ monitoring/start-monitoring.ps1             # Windows startup script
✅ sellia-backend/Dockerfile                  # Backend multi-stage build
✅ sellia-app/Dockerfile                      # Frontend multi-stage build
✅ sellia-backend/src/main/resources/logback-spring.xml
```

### Modified Files:
```
✅ sellia-backend/pom.xml
   - Added micrometer-registry-prometheus
   - Added loki-logback-appender
   - Added spring-boot-starter-actuator

✅ sellia-backend/src/main/resources/application.yml
   - Added management.endpoints configuration
   - Added metrics.enable configuration
   - Added logging.config reference
```

---

## 🔒 Security Notes

### Development:
- ✅ Public access OK
- ✅ Default credentials acceptable

### Production Checklist:
- [ ] Change Grafana admin password
- [ ] Disable Grafana signup
- [ ] Enable authentication on Prometheus
- [ ] Use reverse proxy (nginx)
- [ ] Enable SSL/TLS certificates
- [ ] Restrict network access (firewall)
- [ ] Enable secrets management
- [ ] Rotate credentials regularly

---

## 🛠️ Troubleshooting

### Services not starting?
```bash
docker-compose logs
docker-compose logs sellia-backend
docker-compose logs prometheus
```

### No metrics appearing?
```bash
# Check backend metrics endpoint
curl http://localhost:8080/actuator/prometheus

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

### Logs not appearing in Loki?
```bash
# Check backend logs
docker-compose logs sellia-backend

# Check Loki health
curl http://localhost:3100/ready
```

---

## 🎓 Next Steps

1. **Customize Dashboards:**
   - Add your own panels
   - Create role-specific dashboards
   - Add business metrics

2. **Setup Alerting:**
   - Configure Slack/Email notifications
   - Create custom alert rules
   - Setup on-call rotations

3. **Optimize Storage:**
   - Adjust retention policies
   - Implement archival strategy
   - Monitor disk usage

4. **Advanced Monitoring:**
   - Add APM (Application Performance Monitoring)
   - Implement distributed tracing
   - Add custom metrics

---

## 📚 Documentation

- **Full Documentation:** [`MONITORING.md`](./MONITORING.md)
- **Quick Start:** [`monitoring/README.md`](./monitoring/README.md)
- **Prometheus Docs:** https://prometheus.io/docs/
- **Loki Docs:** https://grafana.com/docs/loki/
- **Grafana Docs:** https://grafana.com/docs/grafana/

---

## ✨ Summary

**You now have:**
- ✅ Complete metrics collection (CPU, Memory, JVM, HTTP)
- ✅ Centralized logging with full-text search
- ✅ Real-time dashboards with 3 pre-built dashboards
- ✅ Automated alerting for critical issues
- ✅ 15-day metrics history
- ✅ 30-day logs history
- ✅ Docker containerization for easy deployment
- ✅ Production-ready architecture

**Quick start:** `docker-compose up -d` then visit http://localhost:3001 (admin/admin)

---

Generated: 2025-10-19
Stack Version: Prometheus 2.x, Loki latest, Grafana latest
