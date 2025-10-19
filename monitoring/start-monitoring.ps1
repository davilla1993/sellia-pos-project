#!/usr/bin/env pwsh

# Sellia POS - Monitoring Stack Startup Script (Windows)

Write-Host "🚀 Starting Sellia POS Monitoring Stack..." -ForegroundColor Green
Write-Host ""

# Check Docker
$docker = Get-Command docker -ErrorAction SilentlyContinue
$docker_compose = Get-Command docker-compose -ErrorAction SilentlyContinue

if ($null -eq $docker -or $null -eq $docker_compose) {
    Write-Host "❌ Docker and Docker Compose must be installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker & Docker Compose found" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "📦 Starting services..."
docker-compose up -d

# Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..."
Start-Sleep -Seconds 10

# Check services
Write-Host ""
Write-Host "🔍 Checking services..."

$services = @(
    "http://localhost:8080/actuator/health",
    "http://localhost:9090/-/healthy",
    "http://localhost:3100/ready",
    "http://localhost:3001/api/health"
)

foreach ($service in $services) {
    Write-Host -NoNewline "  $service... "
    try {
        $response = Invoke-WebRequest -Uri $service -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        Write-Host "✅" -ForegroundColor Green
    }
    catch {
        Write-Host "⏳" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Sellia POS Stack is running!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Access URLs:"
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:     http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Prometheus:  http://localhost:9090" -ForegroundColor Yellow
Write-Host "  Loki:        http://localhost:3100" -ForegroundColor Yellow
Write-Host "  Grafana:     http://localhost:3001 (admin/admin)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 Useful commands:"
Write-Host "  View logs:        docker-compose logs -f"
Write-Host "  Stop services:    docker-compose down"
Write-Host "  Reset (with data): docker-compose down -v"
Write-Host ""
Write-Host "📝 Documentation: See MONITORING.md"
