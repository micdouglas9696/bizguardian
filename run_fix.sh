#!/bin/bash
ssh -o StrictHostKeyChecking=no root@217.196.61.226 bash << 'EOF'
CONTAINER=$(docker ps -q -f name=bizguardian_db.1.)
docker exec -i $CONTAINER psql -U bizguardian_admin -d bizguardian_crm << 'SQL'
ALTER USER bizguardian_admin WITH PASSWORD 'BizG_Pr0d_2026!Secure';
SQL
EOF
