#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  backup.sh — Sauvegarde PostgreSQL + uploads
# ══════════════════════════════════════════════════════════════
set -e

DEPLOY_DIR="/opt/proxilio"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

source $DEPLOY_DIR/.env

mkdir -p $BACKUP_DIR

echo "▶ Sauvegarde base de données..."
docker compose -f $DEPLOY_DIR/docker-compose.yml exec -T db \
  pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

echo "▶ Sauvegarde uploads..."
docker run --rm \
  -v proxilio_uploads:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf "/backup/uploads_$DATE.tar.gz" -C /data .

echo "▶ Suppression des backups > 30 jours..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup terminé : $BACKUP_DIR/db_$DATE.sql.gz"
ls -lh $BACKUP_DIR/*.gz | tail -5
