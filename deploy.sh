#!/bin/bash
# ============================================
# BizGuardian - Deploy to Production VPS
# ============================================

set -e

VPS_IP="217.196.61.226"
VPS_USER="root"
STACK_NAME="bizguardian"
IMAGE_NAME="bizguardian-api"
IMAGE_TAG="latest"

# ── Passo 0: Build do frontend com env de produção ───────────────────────────
echo "🌐 Step 0: Building frontend for production..."
VITE_API_URL=https://api.marinhoponci.com \
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51TURraRmzidCCndcwwYgXaod7tQugPiLlaYyrp8k1pIhbicXi2HQMa897nCwqO5vyEkpui9RkxzDgyMOqeuwFx1000CKZFOYjo \
npm run build

echo "📤 Transferring frontend dist to VPS..."
scp -r dist/* ${VPS_USER}@${VPS_IP}:/root/bizguardian/dist/

# ── Passo 1-2: Build e save da imagem Docker do backend ──────────────────────
echo "🔨 Step 1: Building Docker image..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} ./backend

echo "📦 Step 2: Saving image to tar..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} -o /tmp/${IMAGE_NAME}.tar

# ── Passo 3-4: Transferência para o VPS ──────────────────────────────────────
echo "🚀 Step 3: Transferring image to VPS..."
scp /tmp/${IMAGE_NAME}.tar ${VPS_USER}@${VPS_IP}:/tmp/${IMAGE_NAME}.tar

echo "📄 Step 4: Transferring stack files and migrations..."
scp docker-compose.prod.yml ${VPS_USER}@${VPS_IP}:/root/${STACK_NAME}.yaml
scp backend/init.sql ${VPS_USER}@${VPS_IP}:/root/bizguardian_init.sql
scp -r backend/migrations ${VPS_USER}@${VPS_IP}:/root/bizguardian/migrations

# ── Passo 5: Deploy no VPS ───────────────────────────────────────────────────
echo "⚙️  Step 5: Loading image and deploying on VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE_COMMANDS'
    echo "Loading Docker image..."
    docker load -i /tmp/bizguardian-api.tar
    rm -f /tmp/bizguardian-api.tar

    mkdir -p /root/bizguardian
    mv /root/bizguardian_init.sql /root/bizguardian/init.sql 2>/dev/null || true
    sed -i 's|./backend/init.sql|/root/bizguardian/init.sql|g' /root/bizguardian.yaml

    echo "Loading production secrets from /root/.env.bizguardian ..."
    if [ -f /root/.env.bizguardian ]; then
        source /root/.env.bizguardian
    else
        echo "⚠️  AVISO: /root/.env.bizguardian não encontrado — Stripe e SMTP podem falhar!"
    fi

    export DB_PASSWORD="${DB_PASSWORD:-BizG_Pr0d_2026!Secure}"
    export CORS_ORIGIN="https://marinhoponci.com,https://www.marinhoponci.com"
    export ADMIN_USER="admin"
    export ADMIN_PASS="bizguardian2025"
    export DOCKER_IMAGE="bizguardian-api:latest"
    export SMTP_HOST="${SMTP_HOST:-smtp.resend.com}"
    export SMTP_PORT="${SMTP_PORT:-465}"
    export SMTP_SECURE="${SMTP_SECURE:-true}"
    export SMTP_USER="${SMTP_USER:-resend}"
    export SMTP_PASS="${SMTP_PASS:-}"
    export SMTP_FROM="${SMTP_FROM:-info@marinhoponci.com}"
    export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
    export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"
    export STRIPE_EBOOK_PRICE_ID="${STRIPE_EBOOK_PRICE_ID:-}"

    docker stack deploy -c /root/bizguardian.yaml bizguardian

    echo ""
    echo "✅ Deploy complete! Checking services..."
    sleep 5
    docker service ls | grep bizguardian
REMOTE_COMMANDS

echo ""
echo "✅ Done!"
echo "   API  → https://api.marinhoponci.com"
echo "   Site → https://marinhoponci.com"
echo ""
echo "⚠️  IMPORTANTE: verifique se /root/.env.bizguardian no servidor tem:"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   STRIPE_EBOOK_PRICE_ID=price_..."
echo "   SMTP_PASS=re_sn4XgT17_..."

rm -f /tmp/${IMAGE_NAME}.tar
