/**
 * Automation Engine - trigger n8n workflows + admin CRUD for templates/campaigns/runs.
 *
 * Webhooks n8n esperados (configure cada um no n8n com o path correspondente):
 *   POST  https://webhook.mycom.dev.br/automation/lead-captured
 *   POST  https://webhook.mycom.dev.br/automation/recovery-start
 *   POST  https://webhook.mycom.dev.br/automation/postvenda
 *   POST  https://webhook.mycom.dev.br/automation/campaign-batch
 *
 * Cada um recebe um JSON com { name, email, phone, product, amount, link, custom }.
 */
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE || 'https://webhook.mycom.dev.br/automation';
const N8N_SHARED_SECRET = process.env.N8N_SHARED_SECRET || '';

export interface AutomationPayload {
    name?: string;
    email?: string;
    phone?: string;
    product?: string;
    amount?: number | string;
    link?: string;
    [k: string]: any;
}

/**
 * Dispara um webhook do n8n sem bloquear a resposta HTTP do caller.
 * Falhas só vão pro log — não derrubam o request original.
 */
export async function triggerN8n(workflow: string, payload: AutomationPayload): Promise<void> {
    const url = `${N8N_WEBHOOK_BASE}/${workflow}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(N8N_SHARED_SECRET ? { 'X-Automation-Secret': N8N_SHARED_SECRET } : {}),
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            console.warn(`[automation] n8n ${workflow} returned ${res.status}`);
        }
    } catch (err: any) {
        console.error(`[automation] failed to trigger ${workflow}:`, err?.message || err);
    }
}

/**
 * Fire-and-forget (não aguarda). Use em endpoints que devem responder rápido.
 */
export function triggerN8nAsync(workflow: string, payload: AutomationPayload): void {
    triggerN8n(workflow, payload).catch(() => { /* swallow */ });
}

// =====================================================================
// ADMIN ROUTER  ·  /api/admin/automacoes/*
// =====================================================================

export function createAutomationRouter(pool: Pool, requireAuth: any) {
    const router = Router();

    // ---- TEMPLATES ----
    router.get('/templates', requireAuth, async (_req: Request, res: Response) => {
        try {
            const r = await pool.query(
                `SELECT * FROM automation_templates ORDER BY channel, slug`
            );
            return res.json(r.rows);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.post('/templates', requireAuth, async (req: Request, res: Response) => {
        try {
            const { slug, channel, subject, body, description, audio_url } = req.body || {};
            if (!slug || !channel || !body) return res.status(400).json({ error: 'slug, channel e body são obrigatórios' });
            const r = await pool.query(
                `INSERT INTO automation_templates (slug, channel, subject, body, audio_url, description, is_active)
                 VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *`,
                [slug, channel, subject || null, body, audio_url || null, description || null]
            );
            return res.status(201).json(r.rows[0]);
        } catch (err: any) {
            if (err.code === '23505') return res.status(409).json({ error: 'Slug já existe' });
            return res.status(500).json({ error: err.message });
        }
    });

    router.put('/templates/:slug', requireAuth, async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;
            const { subject, body, audio_url, is_active, description } = req.body || {};
            const r = await pool.query(
                `UPDATE automation_templates
                 SET subject = $1, body = $2, audio_url = $3, is_active = $4,
                     description = $5, updated_at = now()
                 WHERE slug = $6 RETURNING *`,
                [subject || null, body, audio_url || null, is_active !== false, description || null, slug]
            );
            if (r.rowCount === 0) return res.status(404).json({ error: 'Template não encontrado' });
            return res.json(r.rows[0]);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    // ---- CAMPAIGNS ----
    router.get('/campaigns', requireAuth, async (_req: Request, res: Response) => {
        try {
            const r = await pool.query(
                `SELECT * FROM automation_campaigns ORDER BY created_at DESC LIMIT 100`
            );
            return res.json(r.rows);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.get('/campaigns/:id/runs', requireAuth, async (req: Request, res: Response) => {
        try {
            const r = await pool.query(
                `SELECT * FROM automation_runs WHERE campaign_id = $1 ORDER BY created_at DESC LIMIT 500`,
                [req.params.id]
            );
            return res.json(r.rows);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /**
     * Disparo manual de campanha.
     * Body: {
     *   name: string,
     *   template_slug: string,
     *   recipients: [{ name, email, phone }, ...]   // OU
     *   source: 'leads_quiz' | 'leads_priority' | 'leads_contact' | 'ebook_customers'
     * }
     */
    router.post('/campaigns', requireAuth, async (req: Request, res: Response) => {
        try {
            const { name, template_slug, recipients, source } = req.body || {};
            if (!name || !template_slug) {
                return res.status(400).json({ error: 'name e template_slug são obrigatórios' });
            }

            let list: Array<{ name: string; email: string; phone: string }> = [];

            if (Array.isArray(recipients) && recipients.length > 0) {
                list = recipients;
            } else if (source) {
                const sourceMap: Record<string, string> = {
                    leads_quiz: 'SELECT name, email, whatsapp AS phone FROM leads_quiz',
                    leads_priority: 'SELECT name, email, whatsapp AS phone FROM leads_priority',
                    leads_contact: 'SELECT name, email, whatsapp AS phone FROM leads_contact',
                    ebook_customers: 'SELECT name, email, whatsapp AS phone FROM ebook_customers',
                };
                const sql = sourceMap[source];
                if (!sql) return res.status(400).json({ error: 'source inválido' });
                const rr = await pool.query(sql);
                list = rr.rows;
            } else {
                return res.status(400).json({ error: 'Informe recipients ou source' });
            }

            list = list.filter((r) => r.email || r.phone);
            if (list.length === 0) {
                return res.status(400).json({ error: 'Nenhum destinatário válido' });
            }

            // Cria a campanha
            const campaign = await pool.query(
                `INSERT INTO automation_campaigns (name, kind, template_slug, status, total_recipients, started_at)
                 VALUES ($1, 'manual', $2, 'running', $3, now()) RETURNING *`,
                [name, template_slug, list.length]
            );
            const campaignId = campaign.rows[0].id;

            // Insere as runs queued
            for (const r of list) {
                await pool.query(
                    `INSERT INTO automation_runs (campaign_id, template_slug, channel, recipient_name, recipient_email, recipient_phone, payload, status)
                     VALUES ($1, $2, 'whatsapp', $3, $4, $5, $6, 'queued')`,
                    [campaignId, template_slug, r.name || null, r.email || null, r.phone || null, JSON.stringify(r)]
                );
            }

            // Dispara o n8n em batch (n8n lê do banco e envia)
            triggerN8nAsync('campaign-batch', {
                campaign_id: campaignId,
                template_slug,
                total: list.length,
            });

            return res.json({ campaign: campaign.rows[0], queued: list.length });
        } catch (err: any) {
            console.error('[automation] create campaign error:', err);
            return res.status(500).json({ error: err.message });
        }
    });

    // ---- INTEGRAÇÃO N8N (chamadas vindas dos workflows) ----

    // Lista runs em fila de uma campanha (com body do template já resolvido)
    // GET /api/admin/automacoes/campaigns/:id/queued?secret=...
    router.get('/campaigns/:id/queued', async (req: Request, res: Response) => {
        if (N8N_SHARED_SECRET && req.query.secret !== N8N_SHARED_SECRET) {
            return res.status(401).json({ error: 'invalid secret' });
        }
        try {
            const r = await pool.query(
                `SELECT r.id, r.recipient_name, r.recipient_email, r.recipient_phone,
                        t.body AS template_body, t.audio_url, t.subject, t.channel
                 FROM automation_runs r
                 JOIN automation_templates t ON t.slug = r.template_slug
                 WHERE r.campaign_id = $1 AND r.status = 'queued'
                 ORDER BY r.created_at`,
                [req.params.id]
            );
            return res.json(r.rows);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    // Finaliza uma campanha (chamado pelo n8n quando termina o batch)
    router.post('/campaigns/:id/finalize', async (req: Request, res: Response) => {
        if (N8N_SHARED_SECRET && req.headers['x-automation-secret'] !== N8N_SHARED_SECRET) {
            return res.status(401).json({ error: 'invalid secret' });
        }
        try {
            await pool.query(
                `UPDATE automation_campaigns SET
                    status = 'done',
                    finished_at = now(),
                    sent_count = (SELECT COUNT(*) FROM automation_runs WHERE campaign_id = $1 AND status = 'sent'),
                    fail_count = (SELECT COUNT(*) FROM automation_runs WHERE campaign_id = $1 AND status = 'failed')
                 WHERE id = $1`,
                [req.params.id]
            );
            return res.json({ ok: true });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    // ---- WEBHOOK reverso (n8n nos avisa quando enviou) ----
    router.post('/runs/:id/result', async (req: Request, res: Response) => {
        // Endpoint chamado pelo n8n para atualizar status do envio.
        // Protegido por shared secret (X-Automation-Secret).
        const secret = req.headers['x-automation-secret'];
        if (N8N_SHARED_SECRET && secret !== N8N_SHARED_SECRET) {
            return res.status(401).json({ error: 'invalid secret' });
        }
        try {
            const { status, provider_response, error } = req.body || {};
            await pool.query(
                `UPDATE automation_runs
                 SET status = $1, provider_response = $2, error = $3, sent_at = now()
                 WHERE id = $4`,
                [status || 'sent', provider_response ? JSON.stringify(provider_response) : null, error || null, req.params.id]
            );
            return res.json({ ok: true });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    // ---- STATS dashboard ----
    // ---- SETTINGS ----
    router.get('/settings', requireAuth, async (_req: Request, res: Response) => {
        try {
            const r = await pool.query(`SELECT key, value, description FROM automation_settings ORDER BY key`);
            return res.json(r.rows);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.put('/settings/:key', requireAuth, async (req: Request, res: Response) => {
        try {
            const { key } = req.params;
            const { value } = req.body;
            if (value === undefined) return res.status(400).json({ error: 'value required' });
            await pool.query(
                `INSERT INTO automation_settings (key, value, updated_at) VALUES ($1,$2,now())
                 ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
                [key, String(value)]
            );
            return res.json({ ok: true });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.post('/seed-email-templates', requireAuth, async (_req: Request, res: Response) => {
        try {
            await pool.query(`
                INSERT INTO automation_templates (slug,channel,subject,body,description,is_active) VALUES
                ('recovery_5min_email','email','Você esqueceu algo por aqui... 👀',
                 'Olá {{name}}!\n\nNotei que você se interessou pelo Dossiê do Futuro Franqueado mas não finalizou.\n\nSe ficou com alguma dúvida, é só responder este email.\n\nAcesse: {{link}}\n\nAbraço,\nMarinho Ponci',
                 'Email recovery 5 minutos',true),
                ('recovery_24h_email','email','327 pessoas já tomaram a decisão certa 🏆',
                 'Olá {{name}}!\n\nJá são mais de 327 pessoas que usaram o Dossiê para tomar a decisão certa antes de investir em franquia.\n\nAcesse: {{link}}\n\nAbraço,\nMarinho Ponci',
                 'Email recovery 24 horas',true),
                ('recovery_7d_email','email','5% OFF só para você — cupom BIZGUARDIAN5 🎁',
                 'Olá {{name}}!\n\nLiberei um cupom exclusivo de 5% OFF: BIZGUARDIAN5.\nVálido até amanhã.\n\nAcesse: {{link}}\n\nAbraço,\nMarinho Ponci',
                 'Email recovery 7 dias (cupom)',true)
                ON CONFLICT (slug) DO UPDATE SET
                    subject=EXCLUDED.subject, body=EXCLUDED.body,
                    description=EXCLUDED.description, is_active=EXCLUDED.is_active;
            `);
            return res.json({ ok: true, inserted: 3 });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.get('/stats', requireAuth, async (_req: Request, res: Response) => {
        try {
            const r = await pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM automation_campaigns) AS total_campaigns,
                    (SELECT COUNT(*) FROM automation_runs WHERE status = 'sent') AS total_sent,
                    (SELECT COUNT(*) FROM automation_runs WHERE status = 'failed') AS total_failed,
                    (SELECT COUNT(*) FROM automation_runs WHERE status = 'queued') AS total_queued
            `);
            return res.json(r.rows[0]);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    return router;
}
