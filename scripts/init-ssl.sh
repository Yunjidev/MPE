#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  init-ssl.sh — Obtenir le certificat Let's Encrypt (1 seule fois)
# ══════════════════════════════════════════════════════════════
set -e

DOMAIN="proxilio.fr"
EMAIL="contact@proxilio.fr"
COMPOSE="/opt/proxilio"

cd $COMPOSE

echo "▶ Démarrage Nginx en mode HTTP (phase 1)..."
docker compose up -d nginx certbot

echo "▶ Attente 5s que Nginx soit prêt..."
sleep 5

echo "▶ Obtention du certificat Let's Encrypt..."
# Utilise docker run directement pour éviter le conflit avec l'entrypoint du service certbot
docker run --rm \
  -v proxilio_certbot-conf:/etc/letsencrypt \
  -v proxilio_certbot-www:/var/www/certbot \
  --network proxilio_proxilio-net \
  certbot/certbot:latest certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "▶ Activation de la config HTTPS..."
cp nginx/conf.d/proxilio.conf.template nginx/conf.d/proxilio.conf
rm nginx/conf.d/default.conf

echo "▶ Redémarrage Nginx avec SSL..."
docker compose exec nginx nginx -s reload

echo ""
echo "✅ SSL configuré ! https://$DOMAIN est opérationnel."
