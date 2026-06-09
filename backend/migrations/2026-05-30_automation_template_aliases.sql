-- Canonical WhatsApp template slugs consumed by n8n via /automation/send.
-- Keeps existing admin-edited copies intact; only seeds aliases when missing.

INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
SELECT 'lead_imediato', channel, subject, body, audio_url, 'Alias canonico n8n: lead_imediato', is_active
FROM automation_templates
WHERE slug = 'lead_welcome_wa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
SELECT 'recovery_5min', channel, subject, body, audio_url, 'Alias canonico n8n: recovery_5min', is_active
FROM automation_templates
WHERE slug = 'recovery_5min_wa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
SELECT 'recovery_24h', channel, subject, body, audio_url, 'Alias canonico n8n: recovery_24h', is_active
FROM automation_templates
WHERE slug = 'recovery_24h_wa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
SELECT 'recovery_7dias', channel, subject, body, audio_url, 'Alias canonico n8n: recovery_7dias', is_active
FROM automation_templates
WHERE slug = 'recovery_7d_wa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
SELECT 'pos_venda', channel, subject, body, audio_url, 'Alias canonico n8n: pos_venda', is_active
FROM automation_templates
WHERE slug = 'postvenda_wa'
ON CONFLICT (slug) DO NOTHING;
