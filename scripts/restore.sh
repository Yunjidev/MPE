#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  restore.sh — Restauration depuis un backup
#  Usage : bash scripts/restore.sh db_20250528_120000.sql.gz
# ══════════════════════════════════════════════════════════════
set -e

DEPLOY_DIR="/opt/proxilio"
BACKUP_DIR="/opt/backups"
BACKUP_FILE=$1

source $DEPLOY_DIR/.env

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage : bash scripts/restore.sh <nom_du_backup.sql.gz>"
  echo "Backups disponibles :"
  ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || echo "  Aucun backup trouvé"
  exit 1
fi

echo "⚠  Restauration de : $BACKUP_DIR/$BACKUP_FILE"
read -p "   Confirmer ? (oui/non) " CONFIRM
[ "$CONFIRM" != "oui" ] && echo "Annulé." && exit 0

echo "▶ Restauration en cours..."
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | \
  docker compose -f $DEPLOY_DIR/docker-compose.yml exec -T db \
  psql -U $DB_USER $DB_NAME

echo "✅ Restauration terminée."
