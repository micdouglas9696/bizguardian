import express, { Express } from 'express';
import { Pool } from 'pg';
import Stripe from 'stripe';

type Dependencies = {
    pool: Pool;
    stripe: InstanceType<typeof Stripe>;
    getSecret: () => string;
    priceId: string;
    sendMail: (email: string) => Promise<unknown>;
};

export function installWorkshopEmail(app: Express, deps: Dependencies, options: { startWorker: boolean }) {
    app.post('/api/webhooks/stripe/workshop-email', express.raw({ type: 'application/json' }), async (req, res) => {
        const signature = req.header('stripe-signature');
        const secret = deps.getSecret();
        if (!secret) return res.status(503).json({ error: 'Webhook indisponível' });
        if (!signature) return res.status(400).json({ error: 'Assinatura ausente' });
        let event: ReturnType<InstanceType<typeof Stripe>['webhooks']['constructEvent']>;
        try { event = deps.stripe.webhooks.constructEvent(req.body, signature, secret); }
        catch { return res.status(400).json({ error: 'Assinatura inválida' }); }
        if (!event.livemode || !['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
            return res.json({ received: true });
        }
        const session = event.data.object as { id: string; metadata?: { product?: string }; payment_status?: string; customer_details?: { email?: string | null } | null; customer_email?: string | null };
        if (session.metadata?.product !== 'workshop_brasil_europa' || session.payment_status !== 'paid') {
            console.log('[workshop-email] Evento verificado sem envio');
            return res.json({ received: true });
        }
        try {
            const verified = await deps.stripe.checkout.sessions.retrieve(session.id);
            if (!verified.livemode || verified.payment_status !== 'paid' || verified.metadata?.product !== 'workshop_brasil_europa') {
                console.error('[workshop-email] Pagamento não confirmado na Stripe');
                return res.status(503).json({ error: 'Pagamento ainda não confirmado' });
            }
            const items = await deps.stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
            if (items.has_more || items.data.length !== 1 || items.data[0].price?.id !== deps.priceId || items.data[0].quantity !== 1) {
                console.error('[workshop-email] Produto não confere com o preço esperado');
                return res.status(400).json({ error: 'Produto não corresponde ao workshop' });
            }
            const email = verified.customer_details?.email || verified.customer_email;
            if (!email) return res.status(500).json({ error: 'E-mail ausente' });
            await deps.pool.query(`INSERT INTO workshop_confirmation_emails (session_id, customer_email)
                VALUES ($1, $2) ON CONFLICT (session_id) DO NOTHING`, [session.id, email]);
            return res.json({ received: true });
        } catch {
            console.error('[workshop-email] Falha ao validar ou registrar confirmação');
            return res.status(500).json({ error: 'Falha ao registrar confirmação' });
        }
    });

    let processing = false;
    async function processOne(): Promise<void> {
        if (processing) return;
        processing = true;
        try {
            const claimed = await deps.pool.query(`UPDATE workshop_confirmation_emails SET
                status = 'sending', locked_at = NOW(), attempts = attempts + 1
                WHERE session_id = (
                    SELECT session_id FROM workshop_confirmation_emails
                    WHERE (status = 'pending' AND next_attempt <= NOW())
                       OR (status = 'sending' AND locked_at < NOW() - INTERVAL '10 minutes')
                    ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1
                ) RETURNING session_id, customer_email, attempts`);
            if (!claimed.rowCount) return;
            const { session_id: sessionId, customer_email: email, attempts } = claimed.rows[0];
            try {
                await deps.sendMail(email);
                await deps.pool.query(`UPDATE workshop_confirmation_emails SET status='sent', sent_at=NOW(), locked_at=NULL WHERE session_id=$1`, [sessionId]);
            } catch {
                await deps.pool.query(`UPDATE workshop_confirmation_emails SET status='pending', locked_at=NULL,
                    next_attempt=NOW() + ($2 * INTERVAL '1 minute') WHERE session_id=$1`,
                    [sessionId, Math.min(60, Math.pow(2, Math.min(attempts, 6)))]);
                console.error('[workshop-email] Falha no envio; nova tentativa agendada');
            }
        } catch { console.error('[workshop-email] Falha ao acessar fila de confirmação'); }
        finally { processing = false; }
    }
    if (options.startWorker) {
        const interval = setInterval(() => { void processOne(); }, 15_000);
        interval.unref();
        void processOne();
    }
    return { processOne };
}
