#!/bin/bash

# Sellia POS - Monitoring Stack Startup Script

set -e

echo "🚀 Starting Sellia POS Monitoring Stack..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker & Docker Compose found${NC}"
echo ""

# Start services
echo "📦 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check services health
echo ""
echo "🔍 Checking services..."

services=(
    "postgres:5432"
    "sellia-backend:8080/actuator/health"
    "prometheus:9090/-/healthy"
    "loki:3100/ready"
    "grafana:3000/api/health"
)

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    echo -n "  $name... "
    
    if docker-compose exec -T "$name" curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}" 2>/dev/null | grep -q "200\|401\|301"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⏳ (still starting)${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Sellia POS Stack is running!${NC}"
echo ""
echo "📊 Access URLs:"
echo "  Frontend:    ${YELLOW}http://localhost:3000${NC}"
echo "  Backend:     ${YELLOW}http://localhost:8080${NC}"
echo "  Prometheus:  ${YELLOW}http://localhost:9090${NC}"
echo "  Loki:        ${YELLOW}http://localhost:3100${NC}"
echo "  Grafana:     ${YELLOW}http://localhost:3001${NC} (admin/admin)"
echo ""
echo "🔗 Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Reset (with data): docker-compose down -v"
echo ""
echo "📝 Documentation: See MONITORING.md"
