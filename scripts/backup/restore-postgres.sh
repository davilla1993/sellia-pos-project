#!/bin/bash

# =============================================================================
# Sellia POS - PostgreSQL Restore Script
# =============================================================================
# Usage: ./restore-postgres.sh <backup_file.sql.gz>
#
# WARNING: This will DROP and recreate the database!
# =============================================================================

set -e

# Configuration
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-sellia_db}"
DB_USER="${DATABASE_USERNAME:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-changeme}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================================================
# Functions
# =============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

confirm_restore() {
    echo ""
    log_warn "=========================================="
    log_warn "         DATABASE RESTORE WARNING         "
    log_warn "=========================================="
    echo ""
    echo "This operation will:"
    echo "  1. DROP the existing database: $DB_NAME"
    echo "  2. Create a new empty database"
    echo "  3. Restore data from backup"
    echo ""
    log_warn "ALL EXISTING DATA WILL BE LOST!"
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

    if [ "$confirmation" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

verify_backup_file() {
    local backup_file=$1

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    if [ ! -s "$backup_file" ]; then
        log_error "Backup file is empty: $backup_file"
        exit 1
    fi

    log_info "Backup file verified: $backup_file ($(du -h $backup_file | cut -f1))"
}

stop_application() {
    log_info "Stopping application (if running via Docker)..."

    if command -v docker-compose &> /dev/null; then
        docker-compose stop app 2>/dev/null || true
    fi

    # Wait for connections to close
    sleep 2
}

perform_restore() {
    local backup_file=$1

    export PGPASSWORD="$DB_PASSWORD"

    log_info "Terminating existing connections..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '$DB_NAME'
        AND pid <> pg_backend_pid();
    " 2>/dev/null || true

    log_info "Dropping existing database..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

    log_info "Creating new database..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    log_info "Restoring data from backup..."
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$backup_file"
    fi

    unset PGPASSWORD

    log_info "Restore completed successfully!"
}

verify_restore() {
    export PGPASSWORD="$DB_PASSWORD"

    log_info "Verifying restore..."

    # Count tables
    local table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
    " | tr -d ' ')

    # Count rows in key tables
    local user_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) FROM users;
    " 2>/dev/null | tr -d ' ' || echo "0")

    local product_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) FROM products;
    " 2>/dev/null | tr -d ' ' || echo "0")

    unset PGPASSWORD

    echo ""
    echo "=== Restore Verification ==="
    echo "Tables restored: $table_count"
    echo "Users: $user_count"
    echo "Products: $product_count"
    echo ""

    if [ "$table_count" -gt 0 ]; then
        log_info "Database restored successfully!"
    else
        log_error "No tables found after restore. Please check the backup file."
        exit 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        echo "Usage: $0 <backup_file.sql.gz>"
        echo ""
        echo "Example:"
        echo "  $0 /var/backups/sellia/daily/sellia_daily_20240115_020000.sql.gz"
        echo ""
        echo "Available backups:"
        ls -lht /var/backups/sellia/*/sellia_*.sql.gz 2>/dev/null | head -10 || echo "  No backups found"
        exit 1
    fi

    echo ""
    echo "=========================================="
    echo "     Sellia POS - Database Restore"
    echo "=========================================="
    echo ""

    verify_backup_file "$backup_file"
    confirm_restore
    stop_application
    perform_restore "$backup_file"
    verify_restore

    echo ""
    log_info "You can now restart the application"
    echo ""
}

# Run main function
main "$@"
