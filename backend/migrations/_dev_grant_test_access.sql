-- DEV ONLY · concede acesso de teste ao Dossiê para um email
-- Uso:
--   docker exec -i crm_postgres psql -U bizguardian_admin -d bizguardian_crm \
--     -v email="'seu@email.com'" -v name="'Seu Nome'" \
--     < backend/migrations/_dev_grant_test_access.sql
--
-- Imprime no final a URL de ativação que você cola no navegador.

\set ON_ERROR_STOP on

WITH upserted_customer AS (
    INSERT INTO ebook_customers (email, name, access_granted_at)
    VALUES (:email, :name, now())
    ON CONFLICT (email) DO UPDATE
        SET access_granted_at = COALESCE(ebook_customers.access_granted_at, now()),
            updated_at = now()
    RETURNING id, email
),
prod AS (
    SELECT id FROM products WHERE slug = 'dossie-futuro-franqueado'
),
upserted_purchase AS (
    INSERT INTO purchases (customer_id, product_id, granted_at)
    SELECT c.id, p.id, now() FROM upserted_customer c, prod p
    ON CONFLICT (customer_id, product_id) DO UPDATE
        SET revoked_at = NULL,
            granted_at = COALESCE(purchases.granted_at, now())
    RETURNING customer_id
),
new_token AS (
    INSERT INTO ebook_access_tokens (token, customer_id, purpose, expires_at)
    SELECT
        md5(random()::text || clock_timestamp()::text || c.id::text)
            || md5(random()::text || c.id::text),
        c.id,
        'activate',
        now() + interval '14 days'
    FROM upserted_customer c
    RETURNING token
)
SELECT
    'http://localhost:5173/membro/ativar?token=' || token AS activation_url
FROM new_token;
