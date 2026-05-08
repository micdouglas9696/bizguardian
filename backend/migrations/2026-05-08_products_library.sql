-- Migração: biblioteca multi-produto
-- Substitui o foco "módulos do Dossiê" por catálogo de produtos + compras.
-- ebook_modules / ebook_progress permanecem no schema mas não são mais usados.

-- Catálogo de produtos do membro (Dossiê hoje, futuros amanhã)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    cover_url TEXT,                                  -- imagem da capa (opcional)
    access_type VARCHAR(20) NOT NULL DEFAULT 'pdf',  -- pdf | url | route
    access_value TEXT,                               -- caminho do PDF | URL externa | rota interna
    stripe_price_id VARCHAR(255),                    -- vincula com price_id do Stripe
    stripe_metadata_key VARCHAR(100),                -- valor de session.metadata.product
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_published_sort ON products(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price ON products(stripe_price_id);

-- Compras: cliente possui produto. 1 compra por (cliente, produto).
CREATE TABLE IF NOT EXISTS purchases (
    customer_id UUID NOT NULL REFERENCES ebook_customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES ebook_orders(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMP WITH TIME ZONE,             -- preenchido em refund
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    PRIMARY KEY (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);

-- Seed do Dossiê (primeiro produto da biblioteca)
INSERT INTO products
    (slug, title, subtitle, description, access_type, access_value, stripe_metadata_key, sort_order)
VALUES
    ('dossie-futuro-franqueado',
     'O Dossiê do Futuro Franqueado',
     'Programa interativo · 6 módulos + 3 bônus',
     'O método de Marinho Ponci para quem está prestes a investir em uma franquia. 38 anos de experiência transformados em um guia decisório.',
     'pdf',
     'dossie-futuro-franqueado.pdf',
     'dossie_futuro_franqueado',
     1)
ON CONFLICT (slug) DO NOTHING;
