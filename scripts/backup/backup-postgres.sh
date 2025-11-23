#!/bin/bash

# =============================================================================
# Sellia POS - PostgreSQL Backup Script
# =============================================================================
# Usage: ./backup-postgres.sh [daily|weekly|monthly]
#
# This script creates compressed PostgreSQL backups with automatic rotation.
# Configure via environment variables or edit the defaults below.
# =============================================================================

set -e

# Configuration (override with environment variables)
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-sellia_db}"
DB_USER="${DATABASE_USERNAME:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-changeme}"

# Backup directories
BACKUP_BASE_DIR="${BACKUP_DIR:-/var/backups/sellia}"
BACKUP_DAILY_DIR="$BACKUP_BASE_DIR/daily"
BACKUP_WEEKLY_DIR="$BACKUP_BASE_DIR/weekly"
BACKUP_MONTHLY_DIR="$BACKUP_BASE_DIR/monthly"

# Retention policies (number of backups to keep)
DAILY_RETENTION=7
WEEKLY_RETENTION=4
MONTHLY_RETENTION=12

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Logging
LOG_FILE="$BACKUP_BASE_DIR/backup.log"

# =============================================================================
# Functions
# =============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

create_directories() {
    mkdir -p "$BACKUP_DAILY_DIR" "$BACKUP_WEEKLY_DIR" "$BACKUP_MONTHLY_DIR"
    log "Backup directories created/verified"
}

perform_backup() {
    local backup_type=$1
    local backup_dir=$2
    local backup_file="$backup_dir/sellia_${backup_type}_${TIMESTAMP}.sql.gz"

    log "Starting $backup_type backup..."

    # Export password for pg_dump
    export PGPASSWORD="$DB_PASSWORD"

    # Perform backup with compression
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose 2>> "$LOG_FILE" | gzip > "$backup_file"

    # Unset password
    unset PGPASSWORD

    # Verify backup
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "Backup completed: $backup_file ($size)"
        echo "$backup_file"
    else
        log "ERROR: Backup failed or file is empty"
        return 1
    fi
}

rotate_backups() {
    local backup_dir=$1
    local retention=$2
    local backup_type=$3

    log "Rotating $backup_type backups (keeping last $retention)..."

    # Count existing backups
    local count=$(ls -1 "$backup_dir"/sellia_${backup_type}_*.sql.gz 2>/dev/null | wc -l)

    if [ "$count" -gt "$retention" ]; then
        # Delete oldest backups
        local to_delete=$((count - retention))
        ls -1t "$backup_dir"/sellia_${backup_type}_*.sql.gz | tail -n "$to_delete" | xargs rm -f
        log "Deleted $to_delete old $backup_type backup(s)"
    fi
}

backup_uploads() {
    local backup_file="$BACKUP_DAILY_DIR/sellia_uploads_${TIMESTAMP}.tar.gz"
    local uploads_dir="/app/uploads"

    if [ -d "$uploads_dir" ]; then
        log "Backing up uploads directory..."
        tar -czf "$backup_file" -C "$(dirname $uploads_dir)" "$(basename $uploads_dir)" 2>> "$LOG_FILE"
        local size=$(du -h "$backup_file" | cut -f1)
        log "Uploads backup completed: $backup_file ($size)"
    else
        log "Uploads directory not found, skipping"
    fi
}

verify_database_connection() {
    log "Verifying database connection..."
    export PGPASSWORD="$DB_PASSWORD"

    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log "Database connection OK"
        unset PGPASSWORD
        return 0
    else
        log "ERROR: Cannot connect to database"
        unset PGPASSWORD
        return 1
    fi
}

show_status() {
    echo ""
    echo "=== Backup Status ==="
    echo "Daily backups:   $(ls -1 $BACKUP_DAILY_DIR/sellia_daily_*.sql.gz 2>/dev/null | wc -l) files"
    echo "Weekly backups:  $(ls -1 $BACKUP_WEEKLY_DIR/sellia_weekly_*.sql.gz 2>/dev/null | wc -l) files"
    echo "Monthly backups: $(ls -1 $BACKUP_MONTHLY_DIR/sellia_monthly_*.sql.gz 2>/dev/null | wc -l) files"
    echo ""
    echo "Latest backups:"
    ls -lht $BACKUP_BASE_DIR/*/sellia_*.sql.gz 2>/dev/null | head -5
    echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
    local backup_type="${1:-daily}"

    log "=========================================="
    log "Sellia POS Backup - Starting ($backup_type)"
    log "=========================================="

    # Create directories
    create_directories

    # Verify connection
    if ! verify_database_connection; then
        log "Aborting backup due to connection failure"
        exit 1
    fi

    # Perform backup based on type
    case "$backup_type" in
        daily)
            perform_backup "daily" "$BACKUP_DAILY_DIR"
            rotate_backups "$BACKUP_DAILY_DIR" "$DAILY_RETENTION" "daily"
            backup_uploads
            ;;
        weekly)
            perform_backup "weekly" "$BACKUP_WEEKLY_DIR"
            rotate_backups "$BACKUP_WEEKLY_DIR" "$WEEKLY_RETENTION" "weekly"
            ;;
        monthly)
            perform_backup "monthly" "$BACKUP_MONTHLY_DIR"
            rotate_backups "$BACKUP_MONTHLY_DIR" "$MONTHLY_RETENTION" "monthly"
            ;;
        status)
            show_status
            exit 0
            ;;
        *)
            echo "Usage: $0 [daily|weekly|monthly|status]"
            exit 1
            ;;
    esac

    log "Backup process completed successfully"
    log "=========================================="
}

# Run main function
main "$@"
