-- Workshop: captura e fila de revisão. Nenhum disparo é ativado por esta migração.
CREATE TABLE IF NOT EXISTS workshop_leads (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  checkout_session_id TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS workshop_leads_email_idx ON workshop_leads (lower(email));
-- O total é fornecido pela Stripe e pode ser diferente do preço de tabela.
ALTER TABLE workshop_leads ADD COLUMN IF NOT EXISTS amount_paid_cents BIGINT;
ALTER TABLE workshop_leads ADD COLUMN IF NOT EXISTS payment_currency TEXT;
CREATE TABLE IF NOT EXISTS workshop_message_queue (
  id BIGSERIAL PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES workshop_leads(id),
  kind TEXT NOT NULL CHECK (kind IN ('recovery_1h','recovery_24h','buyer_paid','admin_paid')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held','canceled','sent')),
  UNIQUE (lead_id, kind)
);
