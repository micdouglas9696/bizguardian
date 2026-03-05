#!/bin/bash
docker exec $(docker ps -q -f name=bizguardian_db) psql -U bizguardian_admin -d bizguardian_crm -c "ALTER USER bizguardian_admin WITH PASSWORD 'BizG_Pr0d_2026!Secure';"
