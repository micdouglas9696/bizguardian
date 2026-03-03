#!/bin/bash
ssh root@217.196.61.226 << 'REMOTE_COMMANDS'
    docker load -i /tmp/bizguardian-api.tar
    rm -f /tmp/bizguardian-api.tar
    mkdir -p /root/bizguardian
    mv /root/bizguardian_init.sql /root/bizguardian/init.sql 2>/dev/null || true
    sed -i 's|./backend/init.sql|/root/bizguardian/init.sql|g' /root/bizguardian.yaml
    export DB_PASSWORD="BizG_Pr0d_2026!Secure"
    export CORS_ORIGIN="https://marinhoponci.com,https://www.marinhoponci.com"
    export ADMIN_USER="admin"
    export ADMIN_PASS="bizguardian2025"
    export DOCKER_IMAGE="bizguardian-api:latest"
    export SMTP_HOST=""
    export SMTP_PORT="587"
    export SMTP_SECURE="false"
    export SMTP_USER=""
    export SMTP_PASS=""
    export SMTP_FROM="info@marinhoponci.com"
    docker stack deploy -c /root/bizguardian.yaml bizguardian
    sleep 5
    docker service ls | grep bizguardian
REMOTE_COMMANDS
