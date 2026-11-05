-- Confirmações de compra; sessão Stripe é a chave de deduplicação.
CREATE TABLE IF NOT EXISTS workshop_confirmation_emails (
    session_id TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS workshop_confirmation_emails_pending_idx
    ON workshop_confirmation_emails (next_attempt) WHERE status <> 'sent';
