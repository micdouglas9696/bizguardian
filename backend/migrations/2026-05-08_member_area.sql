-- Migração incremental: área do membro do Dossiê (auth + tokens de ativação)
-- Aplique no Postgres existente. init.sql para novas instalações já contém isto.

CREATE TABLE IF NOT EXISTS ebook_access_tokens (
    token VARCHAR(128) PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES ebook_customers(id) ON DELETE CASCADE,
    purpose VARCHAR(20) NOT NULL DEFAULT 'activate',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ebook_access_tokens_customer
    ON ebook_access_tokens(customer_id);
