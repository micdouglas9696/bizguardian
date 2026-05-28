#!/bin/bash
# ============================================
# BizGuardian - Deploy to Production VPS
# Senha pedida UMA vez, reutilizada em tudo
# ============================================

set -e

VPS_IP="217.196.61.226"
VPS_USER="root"
STACK_NAME="bizguardian"
IMAGE_NAME="bizguardian-api"
IMAGE_TAG="latest"

# SSH ControlMaster — uma conexão, uma senha
CTRL_SOCK="/tmp/bizguardian-ssh-$$"
SSH_OPTS="-o StrictHostKeyChecking=no -o ControlMaster=auto -o ControlPath=${CTRL_SOCK} -o ControlPersist=10m"

alias SSH="ssh ${SSH_OPTS}"
alias SCP="scp ${SSH_OPTS}"

echo ""
echo "🔐 Abrindo conexão com o VPS (digite a senha UMA vez)..."
ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} "echo '✅ Conexão estabelecida!'"

echo ""
echo "🌐 Step 0: Build do frontend..."
VITE_API_URL=https://api.marinhoponci.com \
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51TURraRmzidCCndcwwYgXaod7tQugPiLlaYyrp8k1pIhbicXi2HQMa897nCwqO5vyEkpui9RkxzDgyMOqeuwFx1000CKZFOYjo \
npm run build

echo "📤 Enviando frontend para VPS..."
scp ${SSH_OPTS} -r dist/* ${VPS_USER}@${VPS_IP}:/root/bizguardian/dist/

echo "🔨 Step 1: Build Docker backend..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} ./backend

echo "📦 Step 2: Salvando imagem..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} -o /tmp/${IMAGE_NAME}.tar

echo "🚀 Step 3: Enviando imagem para VPS..."
scp ${SSH_OPTS} /tmp/${IMAGE_NAME}.tar ${VPS_USER}@${VPS_IP}:/tmp/${IMAGE_NAME}.tar

echo "📄 Step 4: Enviando arquivos de stack e migrations..."
scp ${SSH_OPTS} docker-compose.prod.yml ${VPS_USER}@${VPS_IP}:/root/${STACK_NAME}.yaml
scp ${SSH_OPTS} backend/init.sql ${VPS_USER}@${VPS_IP}:/root/bizguardian/init.sql
scp ${SSH_OPTS} -r backend/migrations ${VPS_USER}@${VPS_IP}:/root/bizguardian/migrations

echo "⚙️  Step 5: Deploy no VPS..."
ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} bash << 'REMOTE'
set -e
echo "Carregando imagem Docker..."
docker load -i /tmp/bizguardian-api.tar
rm -f /tmp/bizguardian-api.tar

mkdir -p /root/bizguardian
sed -i 's|./backend/init.sql|/root/bizguardian/init.sql|g' /root/bizguardian.yaml 2>/dev/null || true

if [ -f /root/.env.bizguardian ]; then
    source /root/.env.bizguardian
fi

export DB_PASSWORD="${DB_PASSWORD:-BizG_Pr0d_2026!Secure}"
export CORS_ORIGIN="https://marinhoponci.com,https://www.marinhoponci.com"
export ADMIN_USER="admin"
export ADMIN_PASS="bizguardian2025"
export DOCKER_IMAGE="bizguardian-api:latest"

docker stack deploy -c /root/bizguardian.yaml bizguardian 2>/dev/null || \
  docker-compose -f /root/bizguardian.yaml up -d --force-recreate

echo ""
sleep 5
docker service ls | grep bizguardian || docker ps | grep bizguardian
REMOTE

# Fecha o ControlMaster
ssh -O exit -o ControlPath=${CTRL_SOCK} ${VPS_USER}@${VPS_IP} 2>/dev/null || true
rm -f /tmp/${IMAGE_NAME}.tar

echo ""
echo "✅ Deploy concluído!"
echo "   API  → https://api.marinhoponci.com"
echo "   Site → https://marinhoponci.com"
