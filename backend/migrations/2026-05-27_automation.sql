-- =============================================================
-- AUTOMATION ENGINE
-- =============================================================
-- Templates de mensagens (WhatsApp + Email), editáveis no admin.

CREATE TABLE IF NOT EXISTS automation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,         -- ex: lead_welcome_wa, recovery_5min, postvenda_wa
    channel VARCHAR(20) NOT NULL,              -- whatsapp | email
    subject VARCHAR(255),                      -- só para email
    body TEXT NOT NULL,                        -- aceita {{name}} {{link}} {{product}} {{amount}}
    audio_url TEXT,                            -- opcional: áudio humano (whatsapp)
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Campanhas: agrupa um disparo manual ou um fluxo automático.
CREATE TABLE IF NOT EXISTS automation_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    kind VARCHAR(30) NOT NULL,                 -- manual | lead_capture | recovery | postvenda
    template_slug VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | running | done | failed
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_automation_campaigns_status ON automation_campaigns(status, created_at DESC);

-- Log de cada disparo individual.
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES automation_campaigns(id) ON DELETE SET NULL,
    template_slug VARCHAR(100),
    channel VARCHAR(20) NOT NULL,              -- whatsapp | email
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    payload JSONB,                             -- variáveis renderizadas
    status VARCHAR(20) NOT NULL DEFAULT 'queued', -- queued | sent | failed | skipped
    provider_response JSONB,
    error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_campaign ON automation_runs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_runs_email ON automation_runs(recipient_email);

-- Templates iniciais (pode editar pelo admin depois)
INSERT INTO automation_templates (slug, channel, subject, body, description) VALUES
('lead_welcome_wa', 'whatsapp', NULL,
 'Opa, {{name}}! 👋 Aqui é o Marinho.\nVi seu interesse no {{product}}. Seu link tá aqui: {{link}}\nQualquer dúvida, me chama!',
 'Mensagem imediata ao capturar lead'),
('recovery_5min_wa', 'whatsapp', NULL,
 'Oi, {{name}}, é o Marinho. Vi que você não finalizou.\nTravou em alguma coisa? Me chama aqui que eu resolvo rapidinho. 👊\nSe preferir, é só finalizar por aqui: {{link}}',
 'Recuperação 5 minutos após abandono'),
('recovery_24h_wa', 'whatsapp', NULL,
 'Oi, {{name}}! Mais de 327 pessoas já usaram o Dossiê antes de investir numa franquia.\nEm 38 anos de mercado, te garanto: decisão boa é decisão com informação na mão.\nSe quiser conversar, é só chamar — ou finalize aqui: {{link}}',
 'Recuperação 24h com prova social'),
('recovery_7d_wa', 'whatsapp', NULL,
 'Oi, {{name}}! Liberei um cupom de 5% OFF só pra você: BIZGUARDIAN5 — vale até amanhã.\nSe ainda fizer sentido, aproveita: {{link}} 👊',
 'Recuperação 7 dias com cupom'),
('postvenda_wa', 'whatsapp', NULL,
 'Que ótimo te ver aqui dentro, {{name}}! 🎉\nCompra confirmada, {{product}} já liberado na área do membro: https://marinhoponci.com/membro/login (login: {{email}}).\nNão esquece de agendar sua reunião bônus comigo: https://cal.com/marinhoponci — é ali que a gente conversa sobre o seu caso.\nAbraço, Marinho',
 'Pós-venda imediato após pagamento'),
('admin_notify_lead_wa', 'whatsapp', NULL,
 '🟢 NOVO LEAD\nNome: {{name}}\nE-mail: {{email}}\nTelefone: {{phone}}',
 'Notificação para o Marinho ao capturar lead'),
('admin_notify_sale_wa', 'whatsapp', NULL,
 '💰 NOVA VENDA\nComprador: {{name}}\nE-mail: {{email}}\nTelefone: {{phone}}\nProduto: {{product}}\nValor: R$ {{amount}}',
 'Notificação para o Marinho ao confirmar venda')
ON CONFLICT (slug) DO NOTHING;
