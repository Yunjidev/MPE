#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  update.sh — Mise à jour de l'application (zero-downtime)
# ══════════════════════════════════════════════════════════════
set -e

DEPLOY_DIR="/opt/proxilio"
cd $DEPLOY_DIR

echo "════════════════════════════════════════"
echo "  PROXILIO — Mise à jour"
echo "════════════════════════════════════════"

echo "▶ [1/5] Pull dernière version..."
git pull origin main

echo "▶ [2/5] Rebuild images Docker..."
docker compose build --parallel

echo "▶ [3/5] Migrations base de données..."
docker compose run --rm backend npx sequelize-cli db:migrate --env production

echo "▶ [4/5] Redémarrage services (rolling)..."
docker compose up -d --no-deps prerender
sleep 3
docker compose up -d --no-deps backend
sleep 5
docker compose up -d --no-deps frontend
sleep 3
docker compose up -d --no-deps nginx

echo "▶ [5/5] Nettoyage images orphelines..."
docker image prune -f

echo ""
echo "✅ Mise à jour terminée !"
docker compose ps
