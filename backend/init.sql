-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Diagnostic Quiz Leads
CREATE TABLE IF NOT EXISTS leads_quiz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    country_code VARCHAR(10) DEFAULT '+55',
    status VARCHAR(50) DEFAULT 'new'
);

-- Table for Priority List (Internationalization) Leads
CREATE TABLE IF NOT EXISTS leads_priority (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+55',
    status VARCHAR(50) DEFAULT 'new'
);

-- Table for Direct Contact Leads (Footer Form)
CREATE TABLE IF NOT EXISTS leads_contact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50),
    service VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new'
);

-- =============================================================
-- E-BOOK FUNNEL  ·  "O Dossiê do Futuro Franqueado"
-- =============================================================

-- Compradores (área do membro)
CREATE TABLE IF NOT EXISTS ebook_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    whatsapp VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    password_hash VARCHAR(255),
    access_granted_at TIMESTAMP WITH TIME ZONE,
    access_expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = vitalício
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ebook_customers_email ON ebook_customers(email);
CREATE INDEX IF NOT EXISTS idx_ebook_customers_stripe ON ebook_customers(stripe_customer_id);

-- Pedidos (1 cliente pode ter N pedidos: compra + reembolso, etc.)
CREATE TABLE IF NOT EXISTS ebook_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES ebook_customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,  -- snapshot mesmo se cliente for deletado
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    amount_paid_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'brl',
    payment_method VARCHAR(50),  -- card | pix | boleto
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending | paid | refunded | failed
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ebook_orders_session ON ebook_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_status_paid ON ebook_orders(status, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_customer ON ebook_orders(customer_id);

-- Auditoria de webhooks (idempotência: ignora event.id duplicado)
CREATE TABLE IF NOT EXISTS ebook_webhook_events (
    id VARCHAR(255) PRIMARY KEY,  -- stripe event id (evt_xxx)
    type VARCHAR(100) NOT NULL,
    payload JSONB,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tokens de ativação (link enviado por email após compra para definir senha)
CREATE TABLE IF NOT EXISTS ebook_access_tokens (
    token VARCHAR(128) PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES ebook_customers(id) ON DELETE CASCADE,
    purpose VARCHAR(20) NOT NULL DEFAULT 'activate',  -- activate | reset
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ebook_access_tokens_customer ON ebook_access_tokens(customer_id);

-- =============================================================
-- LIBRARY (multi-produto)
-- =============================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    cover_url TEXT,
    access_type VARCHAR(20) NOT NULL DEFAULT 'pdf',
    access_value TEXT,
    stripe_price_id VARCHAR(255),
    stripe_metadata_key VARCHAR(100),
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_published_sort ON products(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price ON products(stripe_price_id);

CREATE TABLE IF NOT EXISTS purchases (
    customer_id UUID NOT NULL REFERENCES ebook_customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES ebook_orders(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    PRIMARY KEY (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);

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
     1),
    ('dossie-futuro-franqueado-en',
     'The Future Franchisee Dossier',
     'Interactive program · 6 modules + 3 bonuses',
     'Marinho Ponci''s method for those about to invest in a franchise, now in English.',
     'pdf',
     'dossie-futuro-franqueado-en.pdf',
     'dossie_futuro_franqueado_en',
     2),
    ('dossie-futuro-franqueador',
     'O Dossiê do Futuro Franqueador',
     'O guia definitivo para formatar sua marca',
     'O método completo para quem deseja transformar seu negócio de sucesso em uma rede de franquias.',
     'pdf',
     'dossie-futuro-franqueador.pdf',
     'dossie_futuro_franqueador',
     3)
ON CONFLICT (slug) DO NOTHING;

-- Módulos (6 principais + 3 bônus + recursos)
CREATE TABLE IF NOT EXISTS ebook_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'module',  -- module | bonus | resource
    order_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    duration_min INTEGER,                         -- minutos
    video_url TEXT,                               -- URL do vídeo (ou youtube embed id)
    video_provider VARCHAR(20) DEFAULT 'native',  -- native | youtube | vimeo
    thumbnail_url TEXT,
    exercises JSONB DEFAULT '[]'::jsonb,          -- [{title, description, type}]
    reflections JSONB DEFAULT '[]'::jsonb,        -- ["pergunta 1", "pergunta 2"]
    pills TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ebook_modules_type_order ON ebook_modules(type, order_index);

-- Progresso do membro por módulo
CREATE TABLE IF NOT EXISTS ebook_progress (
    customer_id UUID NOT NULL REFERENCES ebook_customers(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES ebook_modules(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_position_sec INTEGER DEFAULT 0,
    exercises_done JSONB DEFAULT '{}'::jsonb,    -- { "exercise_id": true }
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (customer_id, module_id)
);

-- =============================================================
-- SEED dos 6 módulos + 3 bônus
-- =============================================================
INSERT INTO ebook_modules (slug, type, order_index, title, subtitle, description, duration_min, pills, exercises, reflections, thumbnail_url) VALUES
('mod-01-situacao-atual', 'module', 1,
 'Avaliando a sua situação atual',
 'Antes de olhar para marcas, olhe para dentro',
 'Perfil, saúde financeira, família. A decisão correta começa aqui, não no site da franqueadora. Marinho mostra como fazer um raio-X honesto da sua realidade antes de sequer pensar em segmento.',
 47,
 ARRAY['Vídeo','Autoavaliação','Reflexão'],
 '[{"title":"Mapa do momento de vida","desc":"Liste as últimas 3 grandes decisões que tomou e o que aprendeu de cada uma."},{"title":"Saúde financeira em 5 perguntas","desc":"Responda com sinceridade ao questionário de capacidade real de investimento."}]'::jsonb,
 '["Por que franquia, e por que agora?","Estou fugindo do quê ao buscar isso?","Minha família topa essa jornada com clareza?"]'::jsonb,
 NULL
),
('mod-02-realidade-franchising', 'module', 2,
 'A realidade do mundo do franchising',
 'Sem salário garantido. Sem fórmula mágica',
 'O que muda quando você passa de colaborador para dono de unidade. Linha do tempo realista do primeiro ano operando.',
 52,
 ARRAY['Vídeo','Linha do tempo','Reflexão brutal'],
 '[{"title":"Sua linha do tempo realista","desc":"Mapeie os primeiros 12 meses de operação com cenário pessimista, realista e otimista."}]'::jsonb,
 '["Você está pronto para 18 meses sem retorno garantido?","Como você lida com incerteza?"]'::jsonb,
 NULL
),
('mod-03-pesquisa-mercado', 'module', 3,
 'Pesquisa de mercado e propósito',
 'A pergunta certa antes da escolha da marca',
 '"Qual franquia dá mais dinheiro?" é a pergunta errada. Marinho mostra a pergunta certa e o método de investigação de campo que você precisa fazer antes de qualquer reunião.',
 41,
 ARRAY['Vídeo','Mapa de afinidades','Investigação de campo'],
 '[{"title":"Mapa de afinidades","desc":"Cruze suas habilidades, paixões e capacidade financeira para chegar a 3 segmentos viáveis."},{"title":"5 visitas obrigatórias","desc":"Visite 5 unidades em operação dos segmentos mapeados, faça as 7 perguntas do checklist."}]'::jsonb,
 '["Eu compraria esse produto/serviço pelo preço cobrado?","Eu trabalharia 60h/semana nesse setor por 3 anos?"]'::jsonb,
 NULL
),
('mod-04-planejamento-financeiro', 'module', 4,
 'Planejamento financeiro real',
 'Os números que ninguém quer ver',
 'Raio-X financeiro pessoal. Capital de giro real. O perigo do financiamento excessivo. Os números honestos que separam quem assina com proteção de quem assina às cegas.',
 68,
 ARRAY['Vídeo','Raio-X financeiro','Business plan pessoal'],
 '[{"title":"Raio-X financeiro pessoal","desc":"Planilha completa de receitas, despesas, reservas e capacidade real de investimento."},{"title":"Capital de giro real","desc":"Calcule capital de giro com cenário pessimista (não o que a franqueadora informa)."}]'::jsonb,
 '["Se a unidade não der lucro nos primeiros 12 meses, eu sobrevivo?","Estou usando dinheiro que NÃO posso perder?"]'::jsonb,
 NULL
),
('mod-05-transicao-jardim', 'module', 5,
 'A transição e a Teoria do Jardim',
 'Como sair do emprego sem saltar no escuro',
 'A lógica dos 2/3 de preparação para 1/3 de execução. Por que a maioria inverte isso e se queima. Plano de transição estruturado.',
 39,
 ARRAY['Vídeo','Plano de transição','Plano B'],
 '[{"title":"Sua transição em 90 dias","desc":"Estruture o plano de saída do CLT com checkpoints de validação."}]'::jsonb,
 '["Qual é meu plano B se em 6 meses operando, não fizer sentido?","Como vou validar se a marca cumpre o prometido antes de assinar?"]'::jsonb,
 NULL
),
('mod-06-momento-decisao', 'module', 6,
 'O momento da decisão',
 'O sim consciente — ou o não sábio',
 'Como transformar meses de estudo em ação consciente. Como saber quando o "sim" está pronto — ou quando o "não" é mais sábio. Cases reais de quem entrou e de quem decidiu não entrar.',
 44,
 ARRAY['Vídeo','Checklist de decisão','Cases reais'],
 '[{"title":"Checklist final de 12 pontos","desc":"Validação dos 12 pontos críticos antes de assinar contrato."}]'::jsonb,
 '["O que mudou em mim ao longo destes 6 módulos?","O sim que eu daria hoje é o mesmo que eu daria há 30 dias?"]'::jsonb,
 NULL
),
('bonus-01-reuniao-franqueador', 'bonus', 1,
 'A Reunião com o Franqueador',
 'O que perguntar, o que observar',
 'Guia completo para a reunião decisiva com o franqueador. As 21 perguntas que ninguém faz, o que significa quando ele hesita, como negociar como adulto.',
 36,
 ARRAY['Vídeo','Checklist','Roteiro'],
 '[]'::jsonb,
 '[]'::jsonb,
 NULL
),
('bonus-02-templates', 'bonus', 2,
 'Templates editáveis',
 'Planilhas e checklists',
 'Planilha de raio-X financeiro, checklist da reunião, mapa de afinidades. Prontos para você preencher.',
 NULL,
 ARRAY['Downloads'],
 '[]'::jsonb,
 '[]'::jsonb,
 NULL
),
('bonus-03-encontros-vivo', 'bonus', 3,
 'Encontros ao vivo',
 'Tira-dúvidas em grupo (90 dias)',
 'Dois encontros mensais ao vivo com Marinho durante 90 dias após sua compra. Em grupo fechado, com transmissão gravada.',
 NULL,
 ARRAY['Ao vivo','Grupo fechado'],
 '[]'::jsonb,
 '[]'::jsonb,
 NULL
)
ON CONFLICT (slug) DO NOTHING;
