#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  deploy.sh — Premier déploiement complet sur VPS IONOS
#  Lancer depuis le serveur : bash scripts/deploy.sh
# ══════════════════════════════════════════════════════════════
set -e

DEPLOY_DIR="/opt/proxilio"
REPO_URL="https://github.com/Yunjidev/MPE.git"   # ← adapte si besoin
DOMAIN="proxilio.fr"

echo "════════════════════════════════════════"
echo "  PROXILIO — Déploiement production"
echo "════════════════════════════════════════"

# ── 1. Pré-requis système ───────────────────────────────────────────────────
echo ""
echo "▶ [1/8] Installation des dépendances système..."
apt-get update -qq
apt-get install -y -qq curl git ufw

# ── 2. Installation Docker ──────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "▶ [2/8] Installation Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "▶ [2/8] Docker déjà installé ✓"
fi

# Docker Compose plugin
if ! docker compose version &>/dev/null; then
  echo "▶      Installation Docker Compose plugin..."
  apt-get install -y -qq docker-compose-plugin
fi

# ── 3. Firewall ─────────────────────────────────────────────────────────────
echo "▶ [3/8] Configuration firewall (UFW)..."
ufw allow 22/tcp   comment 'SSH'    >/dev/null
ufw allow 80/tcp   comment 'HTTP'   >/dev/null
ufw allow 443/tcp  comment 'HTTPS'  >/dev/null
ufw --force enable >/dev/null
echo "   UFW activé (SSH, HTTP, HTTPS)"

# ── 4. Configuration système ─────────────────────────────────────────────────
echo "▶ [4/8] Optimisation système..."
timedatectl set-timezone Europe/Paris

# Swap 2G si inexistant
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "   Swap 2G créé"
fi

# Limites système pour Node.js
cat >> /etc/sysctl.conf <<'EOF'
fs.file-max = 65535
net.core.somaxconn = 65535
EOF
sysctl -p >/dev/null 2>&1 || true

# ── 5. Déploiement du code ──────────────────────────────────────────────────
echo "▶ [5/8] Déploiement du code..."
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

if [ -d ".git" ]; then
  git pull origin main
else
  git clone $REPO_URL . 2>/dev/null || {
    echo "   ⚠ Pas de git remote — utilisez rsync ou copiez manuellement."
    echo "   Continuons avec les fichiers présents..."
  }
fi

# ── 6. Variables d'environnement ────────────────────────────────────────────
echo "▶ [6/8] Vérification .env..."
if [ ! -f ".env" ]; then
  cp .env.production.example .env
  echo ""
  echo "   ⚠  IMPORTANT : Éditez le fichier .env avant de continuer !"
  echo "   → nano /opt/proxilio/.env"
  echo ""
  read -p "   Appuyez sur Entrée une fois le .env configuré..."
fi

# ── 7. Création des dossiers persistants ────────────────────────────────────
echo "▶ [7/8] Structure dossiers..."
mkdir -p certbot/conf certbot/www nginx/conf.d scripts

# ── 8. Build & lancement ────────────────────────────────────────────────────
echo "▶ [8/8] Build Docker et lancement..."
docker compose build --no-cache
docker compose up -d db

echo "   Attente base de données (20s)..."
sleep 20

echo "   Exécution des migrations Sequelize..."
docker compose run --rm backend npx sequelize-cli db:migrate --env production

docker compose up -d

echo ""
echo "════════════════════════════════════════"
echo "  ✅ Stack démarrée !"
echo ""
echo "  Prochaine étape : activer le SSL"
echo "  → bash scripts/init-ssl.sh"
echo "════════════════════════════════════════"
