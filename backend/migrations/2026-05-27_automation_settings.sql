CREATE TABLE IF NOT EXISTS automation_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO automation_settings (key, value, description) VALUES
('recovery_5min_delay_ms',   '300000',       'Delay 1ª mensagem recovery (ms) — padrão 5min'),
('recovery_24h_delay_ms',    '86400000',     'Delay 2ª mensagem recovery (ms) — padrão 24h'),
('recovery_7d_delay_ms',     '604800000',    'Delay 3ª mensagem recovery (ms) — padrão 7 dias'),
('admin_whatsapp',           '558196696184', 'WhatsApp do admin para notificações'),
('n8n_recovery_enabled',     'true',         'Ativa recovery via WhatsApp (n8n)'),
('email_recovery_enabled',   'true',         'Ativa recovery via email')
ON CONFLICT (key) DO NOTHING;
