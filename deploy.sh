#!/bin/bash
# ============================================
# BizGuardian - Deploy to Production VPS
# ============================================
# This script builds the Docker image locally,
# saves, transfers, and deploys to the VPS.
# ============================================

set -e

VPS_IP="217.196.61.226"
VPS_USER="root"
STACK_NAME="bizguardian"
IMAGE_NAME="bizguardian-api"
IMAGE_TAG="latest"

echo "🔨 Step 1: Building Docker image..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} ./backend

echo "📦 Step 2: Saving image to tar..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} -o /tmp/${IMAGE_NAME}.tar

echo "🚀 Step 3: Transferring image to VPS..."
scp /tmp/${IMAGE_NAME}.tar ${VPS_USER}@${VPS_IP}:/tmp/${IMAGE_NAME}.tar

echo "📄 Step 4: Transferring stack files..."
scp docker-compose.prod.yml ${VPS_USER}@${VPS_IP}:/root/${STACK_NAME}.yaml
scp backend/init.sql ${VPS_USER}@${VPS_IP}:/root/bizguardian_init.sql

echo "⚙️  Step 5: Loading image and deploying on VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE_COMMANDS'
    echo "Loading Docker image..."
    docker load -i /tmp/bizguardian-api.tar
    rm -f /tmp/bizguardian-api.tar

    # Create init.sql directory if needed
    mkdir -p /root/bizguardian
    mv /root/bizguardian_init.sql /root/bizguardian/init.sql 2>/dev/null || true

    # Update the stack file to use local init.sql path
    sed -i 's|./backend/init.sql|/root/bizguardian/init.sql|g' /root/bizguardian.yaml

    echo "Deploying stack..."
    if [ -f /root/.env.bizguardian ]; then
        echo "Loading production secrets..."
        source /root/.env.bizguardian
    fi
    export DB_PASSWORD="BizG_Pr0d_2026!Secure"
    export CORS_ORIGIN="https://marinhoponci.com,https://www.marinhoponci.com"
    export ADMIN_USER="admin"
    export ADMIN_PASS="bizguardian2025"
    export DOCKER_IMAGE="bizguardian-api:latest"
    export SMTP_HOST="${SMTP_HOST:-}"
    export SMTP_PORT="${SMTP_PORT:-587}"
    export SMTP_SECURE="${SMTP_SECURE:-false}"
    export SMTP_USER="${SMTP_USER:-}"
    export SMTP_PASS="${SMTP_PASS:-}"
    export SMTP_FROM="${SMTP_FROM:-info@marinhoponci.com}"

    docker stack deploy -c /root/bizguardian.yaml bizguardian

    echo ""
    echo "✅ Deploy complete! Checking services..."
    sleep 5
    docker service ls | grep bizguardian
REMOTE_COMMANDS

echo ""
echo "✅ Done! API will be available at: https://api.marinhoponci.com"
echo ""
echo "⚠️  IMPORTANT: Make sure you have a DNS A record:"
echo "   api.marinhoponci.com -> ${VPS_IP}"

# Cleanup local tar
rm -f /tmp/${IMAGE_NAME}.tar
