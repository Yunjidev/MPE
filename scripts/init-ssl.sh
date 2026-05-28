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

echo "▶ Téléchargement des paramètres SSL recommandés..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
  > ./certbot/conf/options-ssl-nginx.conf 2>/dev/null || true

curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/_internal/ssl-dhparams.pem \
  > ./certbot/conf/ssl-dhparams.pem 2>/dev/null || true

echo "▶ Obtention du certificat Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

echo "▶ Activation de la config HTTPS..."
cp nginx/conf.d/proxilio.conf.template nginx/conf.d/proxilio.conf
rm nginx/conf.d/default.conf

echo "▶ Redémarrage Nginx avec SSL..."
docker compose exec nginx nginx -s reload

echo ""
echo "✅ SSL configuré ! https://$DOMAIN est opérationnel."
