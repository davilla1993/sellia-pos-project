# Sellia POS - Monitoring Stack

Monitoring complet avec **Prometheus** (métriques), **Loki** (logs), et **Grafana** (visualisation).

## 📂 Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Configuration Prometheus
│   └── alerts.yml              # Règles d'alertes
├── loki/
│   └── loki-config.yml         # Configuration Loki
├── grafana/
│   └── provisioning/
│       ├── datasources/        # Data sources Prometheus & Loki
│       │   └── prometheus.yml
│       └── dashboards/
│           ├── dashboard-provider.yml
│           ├── system-metrics.json
│           ├── application-metrics.json
│           └── logs-dashboard.json
├── start-monitoring.sh         # Script startup (Linux/Mac)
└── start-monitoring.ps1        # Script startup (Windows)
```

## 🚀 Quick Start

### Linux/Mac
```bash
cd monitoring
chmod +x start-monitoring.sh
./start-monitoring.sh
```

### Windows
```powershell
cd monitoring
./start-monitoring.ps1
```

### Docker Compose (à la racine du projet)
```bash
docker-compose up -d
```

## 📊 Dashboards

### 1. System Metrics
Visualise l'infrastructure du serveur:
- CPU usage
- Memory usage
- Disk usage
- Backend service status

### 2. Application Metrics
Métriques applicatives Spring Boot:
- HTTP requests/sec
- Response time (95th percentile)
- Error rate (5xx errors)
- JVM Heap memory
- JVM Threads
- Garbage Collection activity

### 3. Logs Dashboard
Visualise les logs centralisés:
- Error logs count
- Log level distribution
- Top applications by volume
- Recent errors table

## 🔗 Endpoints

| Service       | URL                    | Purpose           |
|---------------|------------------------|-------------------|
| Prometheus    | http://localhost:9090  | Query metrics     |
| Loki          | http://localhost:3100  | Query logs        |
| Grafana       | http://localhost:3001  | View dashboards   |
| Backend       | http://localhost:8080  | API + Health      |
| Frontend      | http://localhost:3000  | Web UI            |

## 🎯 Grafana Credentials

- **User:** admin
- **Password:** admin
- **First login:** Change password immediately in Production

## 📈 Example Queries

### Prometheus (PromQL)

```promql
# CPU Usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTP Requests per second
rate(http_server_requests_seconds_count[5m])

# JVM Heap Usage
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# Error Rate (5xx)
(sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / 
 sum(rate(http_server_requests_seconds_count[5m]))) * 100
```

### Loki (LogQL)

```logql
# All error logs
{app="sellia-api"} |= "ERROR"

# Logs with specific pattern
{app="sellia-api"} | json | severity="ERROR"

# Count errors by level
sum by (level) (count_over_time({app="sellia-api"} [1h]))
```

## 🚨 Alerts

Pre-configured alerts:

**Critical:**
- Backend service down (1 min)
- Loki service down (1 min)
- Disk usage > 90%

**Warning:**
- CPU > 80% (5 min)
- Memory > 85% (5 min)
- DB connections > 80% (5 min)
- HTTP error rate > 5% (5 min)
- JVM Heap > 85% (5 min)

Edit `prometheus/alerts.yml` to customize.

## 🔧 Configuration Files

### prometheus.yml
- **Scrape interval:** 15s
- **Evaluation interval:** 15s
- **Retention:** 15 days
- **Jobs:** Backend, Node Exporter, Prometheus, Loki

### loki-config.yml
- **Storage:** Local filesystem
- **Retention:** 30 days
- **Ingestion rate:** 100 MB/s
- **Burst size:** 150 MB

### logback-spring.xml
- **Console appender:** Development
- **Loki appender:** Production
- **Batch size:** 100 logs
- **Timeout:** 5 seconds

## 📊 Performance Metrics

The stack monitors:

**Backend:**
- HTTP requests (count, duration, status codes)
- JVM memory (heap, non-heap)
- Thread count
- Database connections
- Application health

**System:**
- CPU usage
- Memory usage
- Disk space
- Network I/O
- System load

**Application:**
- API latency
- Error rates
- Log volumes
- Service availability

## 🛠️ Troubleshooting

### Services not starting?
```bash
docker-compose logs
```

### No metrics in Prometheus?
1. Check backend health: `http://localhost:8080/actuator/health`
2. Check metrics endpoint: `http://localhost:8080/actuator/prometheus`
3. Verify Prometheus targets: `http://localhost:9090/targets`

### Grafana data sources not connecting?
```bash
docker-compose exec grafana curl http://prometheus:9090/-/healthy
docker-compose exec grafana curl http://loki:3100/ready
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## 📚 Documentation

Full documentation available at project root: [`MONITORING.md`](../MONITORING.md)

## 🔒 Security Notes

- **Production:** Change Grafana password
- **Production:** Disable public access (use reverse proxy)
- **Production:** Enable authentication in Prometheus
- **Production:** Use SSL/TLS certificates
- **Production:** Enable secrets encryption

## 📞 Support

For issues or questions, check:
- [Prometheus Docs](https://prometheus.io/docs/)
- [Loki Docs](https://grafana.com/docs/loki/)
- [Grafana Docs](https://grafana.com/docs/grafana/)
