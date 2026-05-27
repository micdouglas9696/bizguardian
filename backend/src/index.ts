import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAutomationRouter, triggerN8nAsync } from './automation';

// Carrega backend/.env primeiro; se não existir, cai para o .env da raiz do projeto.
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;

// CORS whitelist config
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true
}));

// Set up Postgres Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Email Transporter
// Suporta SMTP "real" (Hostinger/Gmail) ou Ethereal (sandbox de teste — não envia de verdade,
// captura o email e gera uma URL para você ver como ficou).
// Para usar Ethereal: defina SMTP_PROVIDER=ethereal no env (ou deixe SMTP_USER vazio em dev).
let transporter: nodemailer.Transporter;
let ethrealAccount: nodemailer.TestAccount | null = null;

async function initTransporter() {
    const useEthereal =
        process.env.SMTP_PROVIDER === 'ethereal' || !process.env.SMTP_USER;

    if (useEthereal) {
        ethrealAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: ethrealAccount.user, pass: ethrealAccount.pass },
        });
        console.log('[smtp] Ethereal sandbox ativo — emails capturados, não enviados.');
        console.log(`[smtp] Conta: ${ethrealAccount.user}`);
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
            tls: { rejectUnauthorized: false },
        });
        console.log(`[smtp] Provider real: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    }
}
initTransporter().catch((err) => console.error('[smtp] init error:', err));

// Stripe client (apiVersion default da SDK v22)
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

// =====================================================================
// MEMBER AUTH  ·  helpers
// =====================================================================
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-prod';
const JWT_EXPIRES_IN = '30d';
const ACCESS_TOKEN_TTL_DAYS = 14;

interface MemberJwtPayload {
    customer_id: string;
    email: string;
}

function signMemberJwt(payload: MemberJwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyMemberJwt(token: string): MemberJwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as MemberJwtPayload;
    } catch {
        return null;
    }
}

function generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

interface MemberRequest extends Request {
    member?: MemberJwtPayload;
}

function requireMember(req: MemberRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }
    const payload = verifyMemberJwt(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.member = payload;
    next();
}

// =====================================================================
// STRIPE WEBHOOK  —  precisa do raw body, registrado ANTES do json()
// =====================================================================
app.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

        if (!sig || !webhookSecret) {
            console.error('Missing Stripe signature or webhook secret');
            return res.status(400).send('Webhook config missing');
        }

        let event: any;
        try {
            const sigStr = Array.isArray(sig) ? sig[0] : (sig as string);
            event = stripeClient.webhooks.constructEvent(
                req.body,
                sigStr,
                webhookSecret
            );
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Idempotência: ignora eventos repetidos
        try {
            const seen = await pool.query(
                'SELECT id FROM ebook_webhook_events WHERE id = $1',
                [event.id]
            );
            if ((seen.rowCount ?? 0) > 0) {
                console.log(`[stripe] event ${event.id} already processed`);
                return res.json({ received: true, duplicate: true });
            }
            await pool.query(
                'INSERT INTO ebook_webhook_events (id, type, payload) VALUES ($1, $2, $3)',
                [event.id, event.type, JSON.stringify(event)]
            );
        } catch (err) {
            console.error('Webhook idempotency check failed:', err);
        }

        // Processamento por tipo
        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as any;
                    await handleCheckoutCompleted(session);
                    break;
                }
                case 'charge.refunded': {
                    const charge = event.data.object as any;
                    await handleChargeRefunded(charge);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const intent = event.data.object as any;
                    console.log(`[stripe] payment_intent.failed ${intent.id}`);
                    break;
                }
                default:
                    console.log(`[stripe] unhandled event type: ${event.type}`);
            }
        } catch (err: any) {
            console.error(`Error processing webhook ${event.type}:`, err);
            // Retorna 200 mesmo assim para não causar loop de retry — log já registra
        }

        res.json({ received: true });
    }
);

// =====================================================================
// Demais rotas usam JSON body parser
// =====================================================================
app.use(express.json());

// ---- Helpers ----------------------------------------------------------

const getOutcomeForScore = (score: number) => {
    if (score <= 18) return { title: 'Visão Romântica', desc: 'Seu diagnóstico indica que você ainda está na fase de encantamento com o modelo de franquias. O mercado não espera pelo encantamento: ele cobra preparo. Antes de conversar com qualquer franqueadora, você precisa entender a realidade operacional, financeira e emocional de ser um franqueado.' };
    if (score <= 24) return { title: 'Explorador Consciente', desc: 'Você já entendeu que franquia não é atalho e que há riscos reais envolvidos. Isso já te coloca à frente da maioria. Mas ainda existem pontos cegos importantes — especialmente no campo financeiro — que podem custar caro na hora da decisão.' };
    if (score <= 30) return { title: 'Analista em Campo', desc: 'Seu nível de consciência está acima da média. Você já sabe que precisa investigar, questionar e planejar. O que falta é um método estruturado para transformar toda essa consciência em uma decisão técnica.' };
    return { title: 'Decisor Informado', desc: 'Você demonstra um nível de maturidade raro para quem está nessa jornada. Já entende os riscos, já sabe que precisa investigar a fundo e já tem clareza sobre sua realidade financeira e familiar.' };
};

const buildEmailHtml = (name: string, score: number) => {
    const outcome = getOutcomeForScore(score);
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#0a0a0a;">
            <div style="padding:40px 30px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
                <img src="https://marinhoponci.com/marinho%20final.png" alt="Marinho Ponci" style="height:60px;" />
            </div>
            <div style="padding:40px 30px;">
                <p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:800;margin-bottom:24px;">Resultado do seu Diagnóstico</p>
                <h1 style="color:#e1a960;font-size:28px;font-weight:900;margin:0 0 8px;text-transform:uppercase;">${outcome.title}</h1>
                <p style="color:rgba(255,255,255,0.3);font-size:14px;margin-bottom:30px;">Pontuação: <strong style="color:#e1a960;">${score} pontos</strong></p>
                <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:30px;">
                    Olá <strong style="color:white;">${name}</strong>,
                </p>
                <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:30px;">
                    ${outcome.desc}
                </p>
                <div style="background:rgba(225,169,96,0.08);border:1px solid rgba(225,169,96,0.2);border-radius:12px;padding:24px;margin:30px 0;">
                    <p style="color:#e1a960;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Próximo Passo</p>
                    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;line-height:1.6;">A Imersão Franchise-se foi criada pelo Marinho Ponci para quem quer tomar a decisão mais importante da sua vida com clareza e método.</p>
                </div>
                <div style="text-align:center;margin-top:30px;">
                    <a href="https://marinhoponci.com" style="display:inline-block;padding:16px 32px;background:#e1a960;color:#000;text-decoration:none;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;">Saiba Mais</a>
                </div>
            </div>
            <div style="padding:24px 30px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                <p style="color:rgba(255,255,255,0.15);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;margin:0;">© 2026 Marinho Ponci · BizGuardian World Connections</p>
            </div>
        </div>
    </body>
    </html>`;
};

// Email pós-compra do Dossiê — agora com link de ativação da área do membro
const buildEbookWelcomeEmail = (name: string, sessionId: string, activationUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#0a0a0a;">
        <div style="padding:40px 30px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
            ${PUBLIC_URL.includes('localhost') ? '<p style="color:#e1a960;font-size:18px;font-weight:900;margin:0;letter-spacing:2px;">MARINHO PONCI</p>' : `<img src="${PUBLIC_URL}/marinho%20final.png" alt="Marinho Ponci" style="height:60px;" />`}
        </div>
        <div style="padding:40px 30px;">
            <p style="color:#e1a960;font-size:11px;text-transform:uppercase;letter-spacing:3px;font-weight:900;margin-bottom:20px;">Pagamento confirmado</p>
            <h1 style="color:#fff;font-size:30px;font-weight:900;margin:0 0 16px;line-height:1.15;text-transform:uppercase;">
                Bem-vindo ao<br><span style="color:#e1a960;font-style:italic;">Dossiê.</span>
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.75;margin:24px 0;">
                Olá <strong style="color:white;">${name}</strong>,
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.75;margin:0 0 24px;">
                Sua compra de <strong style="color:#e1a960;">O Dossiê do Futuro Franqueado</strong> foi confirmada.
                Clique no botão abaixo para definir sua senha e acessar a área do membro com os 6 módulos em vídeo, exercícios e bônus.
            </p>
            <div style="text-align:center;margin:36px 0;">
                <a href="${activationUrl}" style="display:inline-block;padding:18px 36px;background:#e1a960;color:#000;text-decoration:none;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;">
                    Ativar acesso ao Dossiê
                </a>
            </div>
            <p style="color:rgba(255,255,255,0.45);font-size:12px;line-height:1.7;margin:30px 0 0;text-align:center;">
                Esse link expira em ${ACCESS_TOKEN_TTL_DAYS} dias. Se precisar de um novo, é só responder este email.
            </p>
            <p style="color:rgba(255,255,255,0.45);font-size:13px;line-height:1.7;margin:30px 0 0;">
                Garantia de 7 dias incondicional: se a qualquer momento o Dossiê não fizer sentido pra você, basta responder este email solicitando reembolso.
            </p>
            <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:24px 0 0;">
                Referência da compra: <code style="color:rgba(255,255,255,0.4);">${sessionId}</code>
            </p>
        </div>
        <div style="padding:24px 30px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="color:rgba(255,255,255,0.15);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;margin:0;">© 2026 Marinho Ponci · Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>`;

const buildEbookWelcomeEmailText = (name: string, sessionId: string, activationUrl: string) =>
`Olá ${name},

Sua compra de O Dossiê do Futuro Franqueado foi confirmada!

Acesse o link abaixo para definir sua senha e entrar na área do membro:

${activationUrl}

Esse link expira em ${ACCESS_TOKEN_TTL_DAYS} dias. Se precisar de um novo, responda este email.

Garantia de 7 dias incondicional: se o Dossiê não fizer sentido pra você, basta responder este email solicitando reembolso.

Referência da compra: ${sessionId}

© 2026 Marinho Ponci · Todos os direitos reservados`;

// Email de reset de senha
const buildResetEmail = (name: string, resetUrl: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#0a0a0a;">
        <div style="padding:40px 30px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
            ${PUBLIC_URL.includes('localhost') ? '<p style="color:#e1a960;font-size:18px;font-weight:900;margin:0;letter-spacing:2px;">MARINHO PONCI</p>' : `<img src="${PUBLIC_URL}/marinho%20final.png" alt="Marinho Ponci" style="height:60px;" />`}
        </div>
        <div style="padding:40px 30px;">
            <p style="color:#e1a960;font-size:11px;text-transform:uppercase;letter-spacing:3px;font-weight:900;margin-bottom:20px;">Redefinição de senha</p>
            <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 16px;line-height:1.15;text-transform:uppercase;">
                Redefinir<br><span style="color:#e1a960;font-style:italic;">sua senha.</span>
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.75;margin:24px 0;">
                Olá <strong style="color:white;">${name}</strong>, recebemos um pedido para redefinir
                sua senha. Clique no botão abaixo para escolher uma nova.
            </p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="display:inline-block;padding:18px 36px;background:#e1a960;color:#000;text-decoration:none;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;">
                    Redefinir senha
                </a>
            </div>
            <p style="color:rgba(255,255,255,0.45);font-size:13px;line-height:1.7;margin:24px 0 0;">
                Esse link expira em ${ACCESS_TOKEN_TTL_DAYS} dias. Se você não solicitou,
                pode ignorar este email — sua senha atual continua valendo.
            </p>
        </div>
        <div style="padding:24px 30px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="color:rgba(255,255,255,0.15);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:4px;margin:0;">© 2026 Marinho Ponci</p>
        </div>
    </div>
</body></html>`;

const buildResetEmailText = (name: string, resetUrl: string) =>
`Olá ${name},

Recebemos um pedido para redefinir sua senha.

Clique no link abaixo para escolher uma nova senha:

${resetUrl}

Esse link expira em ${ACCESS_TOKEN_TTL_DAYS} dias.
Se você não solicitou, pode ignorar este email — sua senha continua valendo.

© 2026 Marinho Ponci`;

async function handleCheckoutCompleted(session: any) {
    const email = session.customer_details?.email || session.customer_email || '';
    const name = session.customer_details?.name || 'Comprador';
    const phone = session.customer_details?.phone || '';
    const amount = session.amount_total || 0;
    const currency = session.currency || 'brl';
    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || '';
    const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || '';

    if (!email) {
        console.error('[stripe] checkout.session.completed sem email:', session.id);
        return;
    }

    // Upsert customer
    let customerId: string;
    const existingCust = await pool.query(
        'SELECT id FROM ebook_customers WHERE email = $1',
        [email]
    );

    if ((existingCust.rowCount ?? 0) > 0) {
        customerId = existingCust.rows[0].id;
        await pool.query(
            `UPDATE ebook_customers
             SET name = COALESCE($1, name),
                 whatsapp = COALESCE(NULLIF($2,''), whatsapp),
                 stripe_customer_id = COALESCE(NULLIF($3,''), stripe_customer_id),
                 access_granted_at = COALESCE(access_granted_at, now()),
                 updated_at = now()
             WHERE id = $4`,
            [name, phone, stripeCustomerId, customerId]
        );
    } else {
        const ins = await pool.query(
            `INSERT INTO ebook_customers (email, name, whatsapp, stripe_customer_id, access_granted_at)
             VALUES ($1, $2, $3, $4, now())
             RETURNING id`,
            [email, name, phone, stripeCustomerId]
        );
        customerId = ins.rows[0].id;
    }

    // Insere ou atualiza order
    const orderResult = await pool.query(
        `INSERT INTO ebook_orders
         (customer_id, customer_email, stripe_session_id, stripe_payment_intent, stripe_customer_id,
          amount_paid_cents, currency, payment_method, status, paid_at, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'paid',now(),$9)
         ON CONFLICT (stripe_session_id) DO UPDATE SET
            status = 'paid',
            paid_at = now(),
            stripe_payment_intent = EXCLUDED.stripe_payment_intent,
            customer_id = EXCLUDED.customer_id,
            updated_at = now()
         RETURNING id`,
        [
            customerId,
            email,
            session.id,
            paymentIntentId,
            stripeCustomerId,
            amount,
            currency,
            session.payment_method_types?.[0] || 'card',
            JSON.stringify({ session_metadata: session.metadata || {} })
        ]
    );
    const orderId = orderResult.rows[0].id;

    // Vincula a compra ao produto (matching por stripe_metadata_key OU stripe_price_id)
    const productKey = session.metadata?.product || null;
    const productResult = await pool.query(
        `SELECT id FROM products
         WHERE (stripe_metadata_key = $1 OR stripe_price_id = $2)
           AND is_published = true
         LIMIT 1`,
        [productKey, process.env.STRIPE_EBOOK_PRICE_ID || null]
    );
    if ((productResult.rowCount ?? 0) > 0) {
        const productId = productResult.rows[0].id;
        await pool.query(
            `INSERT INTO purchases (customer_id, product_id, order_id, granted_at)
             VALUES ($1, $2, $3, now())
             ON CONFLICT (customer_id, product_id) DO UPDATE SET
                order_id = EXCLUDED.order_id,
                revoked_at = NULL,
                granted_at = COALESCE(purchases.granted_at, now())`,
            [customerId, productId, orderId]
        );
    } else {
        console.warn(`[stripe] checkout completed but no product matched (key=${productKey})`);
    }

    // Gera token de ativação (1 por compra) e link para o frontend
    const activationToken = generateAccessToken();
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
        `INSERT INTO ebook_access_tokens (token, customer_id, purpose, expires_at)
         VALUES ($1, $2, 'activate', $3)`,
        [activationToken, customerId, expiresAt]
    );
    const activationUrl = `${PUBLIC_URL}/membro/ativar?token=${activationToken}`;

    // Email de boas-vindas
    if (transporter) {
        try {
            const fromAddr = ethrealAccount
                ? `"Marinho Ponci (sandbox)" <no-reply@ethereal.email>`
                : `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
            const info = await transporter.sendMail({
                from: fromAddr,
                to: email,
                subject: 'Bem-vindo ao Dossiê do Futuro Franqueado',
                text: buildEbookWelcomeEmailText(name.split(' ')[0] || 'amigo(a)', session.id, activationUrl),
                html: buildEbookWelcomeEmail(name.split(' ')[0] || 'amigo(a)', session.id, activationUrl)
            });
            console.log(`[ebook] welcome email sent to ${email}`);
            if (ethrealAccount) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log(`[ebook] >>> PREVIEW: ${previewUrl}`);
            }
        } catch (err) {
            console.error('Welcome email error:', err);
        }
    }

    // 🔔 Dispara automação de pós-venda (notifica admin + WhatsApp boas-vindas)
    triggerN8nAsync('postvenda', {
        name,
        email,
        phone,
        product: session.metadata?.product || 'Dossiê do Futuro Franqueado',
        amount: (amount / 100).toFixed(2),
        link: activationUrl,
        session_id: session.id,
    });
}

async function handleChargeRefunded(charge: any) {
    const paymentIntentId = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    await pool.query(
        `UPDATE ebook_orders
         SET status = 'refunded', refunded_at = now(), updated_at = now()
         WHERE stripe_payment_intent = $1`,
        [paymentIntentId]
    );

    // Revoga acesso ao(s) produto(s) dessa order
    await pool.query(
        `UPDATE purchases
         SET revoked_at = now()
         WHERE order_id = (SELECT id FROM ebook_orders WHERE stripe_payment_intent = $1 LIMIT 1)`,
        [paymentIntentId]
    );

    console.log(`[stripe] refunded payment_intent: ${paymentIntentId}`);
}

// Simple Auth Middleware
const requireAuth = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing logic token' });
    }
    const token = authHeader.split(' ')[1];
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'bizguardian2025';
    const validToken = Buffer.from(`${adminUser}:${adminPass}`).toString('base64');

    if (token !== validToken) {
        return res.status(403).json({ error: 'Invalid credentials' });
    }
    next();
};

// =====================================================================
// EBOOK CHECKOUT  ·  cria sessão Stripe e devolve URL/ID
// =====================================================================
app.post('/api/checkout/create-session', async (req: Request, res: Response) => {
    try {
        const { email } = req.body || {};
        const priceId = process.env.STRIPE_EBOOK_PRICE_ID;

        if (!priceId) {
            return res.status(500).json({ error: 'STRIPE_EBOOK_PRICE_ID not configured' });
        }

        const session = await stripeClient.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],  // PIX adicionado automaticamente quando ativo na conta BR
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: email || undefined,
            allow_promotion_codes: true,
            success_url: `${PUBLIC_URL}/ebook/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${PUBLIC_URL}/ebook?canceled=1`,
            metadata: {
                product: 'dossie_futuro_franqueado',
            },
        });

        return res.json({ id: session.id, url: session.url });
    } catch (err: any) {
        console.error('Error creating checkout session:', err);
        return res.status(500).json({ error: err.message || 'Erro ao criar sessão' });
    }
});

// Lookup público para a página de sucesso
app.get('/api/ebook/order/:sessionId', async (req: Request, res: Response) => {
    try {
        const sessionId = String(req.params.sessionId);
        const result = await pool.query(
            `SELECT customer_email, amount_paid_cents, currency, status, paid_at
             FROM ebook_orders WHERE stripe_session_id = $1 LIMIT 1`,
            [sessionId]
        );

        if ((result.rowCount ?? 0) === 0) {
            // Pode não ter chegado ainda — busca diretamente no Stripe como fallback
            try {
                const session = await stripeClient.checkout.sessions.retrieve(sessionId);
                return res.json({
                    customer_email: session.customer_details?.email || null,
                    amount_paid_cents: session.amount_total || 0,
                    currency: session.currency || 'brl',
                    status: session.payment_status === 'paid' ? 'paid' : 'pending',
                    paid_at: null,
                });
            } catch {
                return res.status(404).json({ error: 'Order not found' });
            }
        }
        return res.json(result.rows[0]);
    } catch (err: any) {
        console.error('Order lookup error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =====================================================================
// LEAD ENDPOINTS (existentes — preservados)
// =====================================================================

app.post('/api/leads/quiz', async (req: Request, res: Response) => {
    const { name, email, whatsapp, score, answers } = req.body;
    try {
        const query = `
            INSERT INTO leads_quiz (name, email, whatsapp, score, answers)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const result = await pool.query(query, [name, email, whatsapp, score, JSON.stringify(answers)]);
        res.status(201).json({ success: true, id: result.rows[0].id });

        // Send diagnostic email asynchronously (non-blocking)
        if (email && process.env.SMTP_USER) {
            const html = buildEmailHtml(name || 'Participante', score);
            const outcome = getOutcomeForScore(score);
            transporter.sendMail({
                from: `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: `Seu Diagnóstico de Maturidade para Franchising — ${outcome.title}`,
                text: `Olá ${name || 'Participante'},\n\nSeu resultado: ${outcome.title}\n\n${outcome.desc}\n\nSaiba mais em: https://marinhoponci.com\n\n© 2026 Marinho Ponci`,
                html
            }).catch(err => console.error('Email send error:', err));
        }
    } catch (error) {
        console.error('Error inserting quiz lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/leads/priority', async (req: Request, res: Response) => {
    const { name, email, whatsapp } = req.body;
    try {
        const query = `
            INSERT INTO leads_priority (name, email, whatsapp)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const result = await pool.query(query, [name, email, whatsapp]);
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error inserting priority lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/leads/quiz', requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM leads_quiz ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quiz leads' });
    }
});

app.get('/api/leads/priority', requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM leads_priority ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching priority leads' });
    }
});

// Contact Leads (Footer Form)
app.post('/api/leads/contact', async (req: Request, res: Response) => {
    const { name, email, whatsapp, service, message } = req.body;
    try {
        const query = `
            INSERT INTO leads_contact (name, email, whatsapp, service, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const result = await pool.query(query, [name, email, whatsapp || '', service || '', message || '']);
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error inserting contact lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/leads/contact', requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM leads_contact ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching contact leads' });
    }
});

// =====================================================================
// REMARKETING POR EMAIL — recovery 5min / 24h / 7d
// =====================================================================

function renderTpl(body: string, vars: Record<string, string>): string {
    return body.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

function bodyToHtml(text: string, link: string): string {
    const escaped = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e">
        ${escaped}
        <br><br>
        <a href="${link}" style="background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            Acessar agora →
        </a>
    </div>`;
}

async function scheduleRecoveryEmails(name: string, email: string, link: string): Promise<void> {
    const from = `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'info@marinhoponci.com'}>`;
    const vars = { name, email, link };

    const settingsR = await pool.query(
        `SELECT key, value FROM automation_settings WHERE key IN ('recovery_5min_delay_ms','recovery_24h_delay_ms','recovery_7d_delay_ms','email_recovery_enabled') LIMIT 10`
    ).catch(() => ({ rows: [] as any[] }));
    const cfg: Record<string, string> = {};
    for (const row of settingsR.rows) cfg[row.key] = row.value;
    if (cfg['email_recovery_enabled'] === 'false') return;

    const slugs: Array<{ slug: string; delayMs: number }> = [
        { slug: 'recovery_5min_email',  delayMs: Number(cfg['recovery_5min_delay_ms']  || 5 * 60 * 1000) },
        { slug: 'recovery_24h_email',   delayMs: Number(cfg['recovery_24h_delay_ms']   || 24 * 60 * 60 * 1000) },
        { slug: 'recovery_7d_email',    delayMs: Number(cfg['recovery_7d_delay_ms']    || 7 * 24 * 60 * 60 * 1000) },
    ];

    // Cria campanha de recovery para tracking de stats
    const campR = await pool.query(
        `INSERT INTO automation_campaigns (name, kind, template_slug, status, total_recipients, started_at)
         VALUES ($1, 'recovery_email', 'recovery_email', 'running', $2, now()) RETURNING id`,
        [`Recovery Email — ${email}`, slugs.length]
    ).catch(() => ({ rows: [{ id: null }] }));
    const campaignId = campR.rows[0]?.id;

    for (const { slug, delayMs } of slugs) {
        // Cria run como queued
        const runR = await pool.query(
            `INSERT INTO automation_runs (campaign_id, template_slug, recipient_name, recipient_email, recipient_phone, status)
             VALUES ($1,$2,$3,$4,$5,'queued') RETURNING id`,
            [campaignId, slug, name, email, '']
        ).catch(() => ({ rows: [{ id: null }] }));
        const runId = runR.rows[0]?.id;

        pool.query(
            `SELECT subject, body FROM automation_templates WHERE slug=$1 AND is_active=true`,
            [slug]
        ).then(r => {
            if (!r.rows[0]) return;
            const { subject, body } = r.rows[0];
            const rendered = renderTpl(body, vars);
            setTimeout(async () => {
                try {
                    await transporter.sendMail({
                        from, to: email,
                        subject: renderTpl(subject || '', vars),
                        text: rendered,
                        html: bodyToHtml(rendered, link),
                    });
                    if (runId) pool.query(`UPDATE automation_runs SET status='sent', sent_at=now() WHERE id=$1`, [runId]).catch(() => {});
                    pool.query(`UPDATE automation_campaigns SET sent_count=sent_count+1 WHERE id=$1`, [campaignId]).catch(() => {});
                } catch (err) {
                    console.error(`[recovery-email] ${slug}:`, err);
                    if (runId) pool.query(`UPDATE automation_runs SET status='failed' WHERE id=$1`, [runId]).catch(() => {});
                    pool.query(`UPDATE automation_campaigns SET fail_count=fail_count+1 WHERE id=$1`, [campaignId]).catch(() => {});
                }
            }, delayMs);
        }).catch(err => console.error(`[recovery-email] load template ${slug}:`, err));
    }
}

// =====================================================================
// EBOOK PRE-CHECKOUT LEADS  ·  captura antes do Stripe
// =====================================================================

pool.query(`
    CREATE TABLE IF NOT EXISTS automation_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT now()
    )
`).then(() => pool.query(`
    INSERT INTO automation_settings (key,value,description) VALUES
    ('recovery_5min_delay_ms','300000','Delay 1ª mensagem recovery (ms)'),
    ('recovery_24h_delay_ms','86400000','Delay 2ª mensagem recovery (ms)'),
    ('recovery_7d_delay_ms','604800000','Delay 3ª mensagem recovery (ms)'),
    ('admin_whatsapp','558196696184','WhatsApp admin para notificações'),
    ('n8n_recovery_enabled','true','Ativa recovery via WhatsApp'),
    ('email_recovery_enabled','true','Ativa recovery via email')
    ON CONFLICT (key) DO NOTHING
`)).catch(err => console.error('[db] automation_settings create error:', err));

pool.query(`
    CREATE TABLE IF NOT EXISTS ebook_checkout_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
`).catch(err => console.error('[db] ebook_checkout_leads create error:', err));

app.post('/api/leads/ebook', async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    try {
        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPhone = String(phone || '').trim();
        await pool.query(
            `INSERT INTO ebook_checkout_leads (name, email, phone) VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [cleanName, cleanEmail, cleanPhone]
        );

        // 🔔 Dispara automação: notifica admin + envia 1ª mensagem ao lead
        triggerN8nAsync('lead-captured', {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            link: `${PUBLIC_URL}/ebook`,
            product: 'Dossiê do Futuro Franqueado',
        });
        // Agenda recuperação (5min/24h/7d) — n8n controla os waits (WhatsApp)
        triggerN8nAsync('recovery-start', {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            link: `${PUBLIC_URL}/ebook`,
            product: 'Dossiê do Futuro Franqueado',
        });

        // Remarketing por email (independente do n8n)
        scheduleRecoveryEmails(cleanName, cleanEmail, `${PUBLIC_URL}/ebook`);

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('ebook lead insert error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/ebook/leads', requireAuth, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ebook_checkout_leads ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching ebook leads' });
    }
});

// =====================================================================
// ADMIN MEMBER MANAGEMENT
// =====================================================================

// Lista todos os membros
app.get('/api/admin/members', requireAuth, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT c.id, c.name, c.email, c.whatsapp,
                   c.access_granted_at, c.access_expires_at, c.last_login_at,
                   c.password_hash IS NOT NULL AS activated,
                   EXISTS(
                       SELECT 1 FROM purchases pu
                       WHERE pu.customer_id = c.id AND pu.revoked_at IS NULL
                   ) AS has_access,
                   c.created_at
            FROM ebook_customers c
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching members' });
    }
});

// Cria membro manualmente e envia email de ativação
app.post('/api/admin/members', requireAuth, async (req: Request, res: Response) => {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });

    try {
        const emailLower = String(email).trim().toLowerCase();

        let customerId: string;
        const existing = await pool.query(
            'SELECT id FROM ebook_customers WHERE LOWER(email) = $1', [emailLower]
        );

        if ((existing.rowCount ?? 0) > 0) {
            customerId = existing.rows[0].id;
            await pool.query(
                `UPDATE ebook_customers SET name = $1, updated_at = now(),
                 access_granted_at = COALESCE(access_granted_at, now()) WHERE id = $2`,
                [String(name).trim(), customerId]
            );
        } else {
            const ins = await pool.query(
                `INSERT INTO ebook_customers (email, name, access_granted_at)
                 VALUES ($1, $2, now()) RETURNING id`,
                [emailLower, String(name).trim()]
            );
            customerId = ins.rows[0].id;
        }

        // Garante acesso ao produto principal
        const productResult = await pool.query(
            `SELECT id FROM products WHERE is_published = true ORDER BY sort_order LIMIT 1`
        );
        if ((productResult.rowCount ?? 0) > 0) {
            const productId = productResult.rows[0].id;
            await pool.query(
                `INSERT INTO purchases (customer_id, product_id, granted_at)
                 VALUES ($1, $2, now())
                 ON CONFLICT (customer_id, product_id) DO UPDATE SET revoked_at = NULL, granted_at = COALESCE(purchases.granted_at, now())`,
                [customerId, productId]
            );
        }

        // Gera token de ativação e envia email
        const activationToken = generateAccessToken();
        const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        await pool.query(
            `INSERT INTO ebook_access_tokens (token, customer_id, purpose, expires_at)
             VALUES ($1, $2, 'activate', $3)`,
            [activationToken, customerId, expiresAt]
        );
        const activationUrl = `${PUBLIC_URL}/membro/ativar?token=${activationToken}`;

        if (transporter) {
            try {
                const firstName = String(name).trim().split(' ')[0] || 'amigo(a)';
                const fromAddr = ethrealAccount
                    ? `"Marinho Ponci (sandbox)" <no-reply@ethereal.email>`
                    : `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
                const info = await transporter.sendMail({
                    from: fromAddr,
                    to: emailLower,
                    subject: 'Seu acesso ao Dossiê do Futuro Franqueado',
                    text: buildEbookWelcomeEmailText(firstName, 'manual', activationUrl),
                    html: buildEbookWelcomeEmail(firstName, 'manual', activationUrl),
                });
                if (ethrealAccount) {
                    console.log(`[admin] >>> PREVIEW: ${nodemailer.getTestMessageUrl(info)}`);
                }
            } catch (err) {
                console.error('admin member email error:', err);
            }
        }

        res.json({ ok: true, customer_id: customerId, activation_url: activationUrl });
    } catch (err: any) {
        console.error('create member error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Revoga ou restaura acesso de um membro
app.patch('/api/admin/members/:id/access', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { revoke } = req.body || {};
    try {
        if (revoke) {
            await pool.query(`UPDATE purchases SET revoked_at = now() WHERE customer_id = $1`, [id]);
        } else {
            await pool.query(`UPDATE purchases SET revoked_at = NULL WHERE customer_id = $1`, [id]);
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error updating access' });
    }
});

// Reenvia email de ativação para um membro
app.post('/api/admin/members/:id/resend', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const custResult = await pool.query(
            'SELECT id, email, name FROM ebook_customers WHERE id = $1', [id]
        );
        if ((custResult.rowCount ?? 0) === 0) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }
        const { email, name } = custResult.rows[0];

        const activationToken = generateAccessToken();
        const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        await pool.query(
            `INSERT INTO ebook_access_tokens (token, customer_id, purpose, expires_at)
             VALUES ($1, $2, 'activate', $3)`,
            [activationToken, id, expiresAt]
        );
        const activationUrl = `${PUBLIC_URL}/membro/ativar?token=${activationToken}`;

        if (transporter) {
            const firstName = (name || '').split(' ')[0] || 'amigo(a)';
            const fromAddr = ethrealAccount
                ? `"Marinho Ponci (sandbox)" <no-reply@ethereal.email>`
                : `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
            const info = await transporter.sendMail({
                from: fromAddr,
                to: email,
                subject: 'Seu acesso ao Dossiê do Futuro Franqueado',
                text: buildEbookWelcomeEmailText(firstName, 'resend', activationUrl),
                html: buildEbookWelcomeEmail(firstName, 'resend', activationUrl),
            });
            if (ethrealAccount) {
                console.log(`[admin] resend >>> PREVIEW: ${nodemailer.getTestMessageUrl(info)}`);
            }
        }

        res.json({ ok: true, activation_url: activationUrl });
    } catch (err: any) {
        console.error('resend activation error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Admin: lista sessões Stripe recentes (pra reconciliar manualmente o que webhook não processou)
app.get('/api/admin/ebook/stripe-sessions', requireAuth, async (_req: Request, res: Response) => {
    try {
        const sessions = await stripeClient.checkout.sessions.list({ limit: 25 });
        const sessionIds = sessions.data.map(s => s.id);
        const processed = sessionIds.length > 0
            ? await pool.query(
                `SELECT stripe_session_id FROM ebook_orders WHERE stripe_session_id = ANY($1)`,
                [sessionIds]
            )
            : { rows: [] as any[] };
        const processedSet = new Set(processed.rows.map((r: any) => r.stripe_session_id));
        res.json(sessions.data.map(s => ({
            id: s.id,
            email: s.customer_details?.email || s.customer_email || null,
            name: s.customer_details?.name || null,
            payment_status: s.payment_status,
            amount_total: s.amount_total,
            currency: s.currency,
            created: s.created,
            metadata: s.metadata || {},
            already_processed: processedSet.has(s.id),
        })));
    } catch (err: any) {
        console.error('list stripe sessions error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Admin: processa manualmente uma sessão Stripe (fallback quando webhook falha)
app.post('/api/admin/ebook/process-session', requireAuth, async (req: Request, res: Response) => {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id é obrigatório' });
    try {
        const session = await stripeClient.checkout.sessions.retrieve(String(session_id));
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                error: `Session não está paga (status: ${session.payment_status})`,
            });
        }
        await handleCheckoutCompleted(session);
        res.json({ ok: true, session_id, email: session.customer_details?.email });
    } catch (err: any) {
        console.error('process-session error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Admin: pedidos do ebook
app.get('/api/admin/ebook/orders', requireAuth, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT o.*, c.name AS customer_name
             FROM ebook_orders o
             LEFT JOIN ebook_customers c ON c.id = o.customer_id
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching ebook orders:', error);
        res.status(500).json({ error: 'Error fetching ebook orders' });
    }
});

// =====================================================================
// MEMBER AUTH ENDPOINTS  ·  ativação, login, sessão
// =====================================================================

// Valida token de ativação (mostra email/nome para o user antes de definir senha)
app.get('/api/ebook/auth/validate-token', async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).json({ error: 'Token ausente' });
    try {
        const result = await pool.query(
            `SELECT t.token, t.expires_at, t.used_at, c.email, c.name, c.password_hash
             FROM ebook_access_tokens t
             JOIN ebook_customers c ON c.id = t.customer_id
             WHERE t.token = $1`,
            [token]
        );
        if ((result.rowCount ?? 0) === 0) {
            return res.status(404).json({ error: 'Token inválido' });
        }
        const row = result.rows[0];
        if (row.used_at) return res.status(410).json({ error: 'Token já utilizado' });
        if (new Date(row.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Token expirado' });
        }
        res.json({
            email: row.email,
            name: row.name,
            already_set: !!row.password_hash,
        });
    } catch (err) {
        console.error('validate-token error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define senha (primeira vez ou reset) usando token de ativação
app.post('/api/ebook/auth/setup', async (req: Request, res: Response) => {
    const { token, password } = req.body || {};
    if (!token || !password) {
        return res.status(400).json({ error: 'Token e senha são obrigatórios' });
    }
    if (String(password).length < 8) {
        return res.status(400).json({ error: 'A senha precisa ter ao menos 8 caracteres' });
    }
    try {
        const result = await pool.query(
            `SELECT t.customer_id, t.expires_at, t.used_at, c.email
             FROM ebook_access_tokens t
             JOIN ebook_customers c ON c.id = t.customer_id
             WHERE t.token = $1`,
            [token]
        );
        if ((result.rowCount ?? 0) === 0) {
            return res.status(404).json({ error: 'Token inválido' });
        }
        const row = result.rows[0];
        if (row.used_at) return res.status(410).json({ error: 'Token já utilizado' });
        if (new Date(row.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Token expirado' });
        }
        const hash = await bcrypt.hash(String(password), 10);
        await pool.query(
            `UPDATE ebook_customers
             SET password_hash = $1, last_login_at = now(), updated_at = now()
             WHERE id = $2`,
            [hash, row.customer_id]
        );
        await pool.query(
            `UPDATE ebook_access_tokens SET used_at = now() WHERE token = $1`,
            [token]
        );
        const jwtToken = signMemberJwt({ customer_id: row.customer_id, email: row.email });
        res.json({ token: jwtToken, email: row.email });
    } catch (err) {
        console.error('auth/setup error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Solicita reset de senha → gera token, envia email (sempre 200, mesmo email inexistente)
app.post('/api/ebook/auth/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });
    try {
        const result = await pool.query(
            `SELECT id, name FROM ebook_customers WHERE LOWER(email) = LOWER($1) LIMIT 1`,
            [String(email)]
        );
        if ((result.rowCount ?? 0) === 0) {
            // Resposta genérica — não vaza se email existe
            return res.json({ ok: true });
        }
        const { id: customerId, name } = result.rows[0];
        const token = generateAccessToken();
        const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        await pool.query(
            `INSERT INTO ebook_access_tokens (token, customer_id, purpose, expires_at)
             VALUES ($1, $2, 'reset', $3)`,
            [token, customerId, expiresAt]
        );
        const resetUrl = `${PUBLIC_URL}/membro/redefinir?token=${token}`;
        if (transporter) {
            try {
                const fromAddr = ethrealAccount
                    ? `"Marinho Ponci (sandbox)" <no-reply@ethereal.email>`
                    : `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
                const info = await transporter.sendMail({
                    from: fromAddr,
                    to: email,
                    subject: 'Redefinir sua senha · Marinho Ponci',
                    text: buildResetEmailText(name?.split(' ')[0] || 'amigo(a)', resetUrl),
                    html: buildResetEmail(name?.split(' ')[0] || 'amigo(a)', resetUrl),
                });
                if (ethrealAccount) {
                    console.log(`[reset] >>> PREVIEW: ${nodemailer.getTestMessageUrl(info)}`);
                }
            } catch (err) {
                console.error('reset email error:', err);
            }
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('forgot-password error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login email + senha → JWT
app.post('/api/ebook/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    try {
        const result = await pool.query(
            `SELECT id, email, password_hash, access_expires_at
             FROM ebook_customers WHERE LOWER(email) = LOWER($1) LIMIT 1`,
            [String(email)]
        );
        if ((result.rowCount ?? 0) === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const row = result.rows[0];
        if (!row.password_hash) {
            return res.status(403).json({ error: 'Acesso ainda não ativado. Verifique o link recebido por email.' });
        }
        if (row.access_expires_at && new Date(row.access_expires_at) < new Date()) {
            return res.status(403).json({ error: 'Acesso expirado.' });
        }
        const ok = await bcrypt.compare(String(password), row.password_hash);
        if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

        await pool.query(
            `UPDATE ebook_customers SET last_login_at = now() WHERE id = $1`,
            [row.id]
        );
        const token = signMemberJwt({ customer_id: row.id, email: row.email });
        res.json({ token, email: row.email });
    } catch (err) {
        console.error('auth/login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Dados do membro logado
app.get('/api/ebook/me', requireMember, async (req: MemberRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, email, name, whatsapp, access_granted_at, access_expires_at, last_login_at
             FROM ebook_customers WHERE id = $1`,
            [req.member!.customer_id]
        );
        if ((result.rowCount ?? 0) === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('me error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =====================================================================
// PUBLIC MEDIA  ·  vídeos e arquivos públicos (ex: boas-vindas)
// =====================================================================
const PUBLIC_MEDIA_DIR = path.resolve(__dirname, '../public_media');
app.use('/api/media', express.static(PUBLIC_MEDIA_DIR));

// 🤖 AUTOMATION ROUTER (templates, campaigns, runs, stats)
app.use('/api/admin/automacoes', createAutomationRouter(pool, requireAuth));

// =====================================================================
// MEMBER LIBRARY  ·  vitrine multi-produto
// =====================================================================
const PRIVATE_ASSETS_DIR = path.resolve(__dirname, '../private_assets');

// Token de download de curta duração — assinado com JWT, embutido na URL.
// Permite o navegador baixar via <a href> sem precisar de header Authorization
// (e portanto sem ser interceptado por extensões/proxies).
interface DownloadJwtPayload {
    customer_id: string;
    product_slug: string;
    kind: 'download' | 'pages';
}

function signDownloadJwt(payload: DownloadJwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
}

function verifyDownloadJwt(token: string, expectedKind?: 'download' | 'pages'): DownloadJwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const kind = decoded?.kind;
        if (kind !== 'download' && kind !== 'pages') return null;
        if (expectedKind && kind !== expectedKind) return null;
        return decoded as DownloadJwtPayload;
    } catch {
        return null;
    }
}

// Diretório de páginas pre-renderizadas (JPEG): <basename>-pages/
function getPagesDir(accessValue: string): string {
    const basename = accessValue.replace(/\.pdf$/i, '');
    return path.join(PRIVATE_ASSETS_DIR, `${basename}-pages`);
}

async function countPageImages(pagesDir: string): Promise<number> {
    try {
        const files = await fs.promises.readdir(pagesDir);
        return files.filter((f) => /^page-\d+\.jpg$/i.test(f)).length;
    } catch {
        return 0;
    }
}

// Lista os produtos que o membro comprou (não revogados)
app.get('/api/ebook/library', requireMember, async (req: MemberRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT p.slug, p.title, p.subtitle, p.description, p.cover_url, p.access_type,
                    pu.granted_at, pu.last_accessed_at, pu.access_count
             FROM purchases pu
             JOIN products p ON p.id = pu.product_id
             WHERE pu.customer_id = $1
               AND pu.revoked_at IS NULL
               AND p.is_published = true
             ORDER BY p.sort_order, pu.granted_at DESC`,
            [req.member!.customer_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('library list error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// (1) Frontend (autenticado) pede um link de download de curta duração
app.post('/api/ebook/products/:slug/access-link', requireMember, async (req: MemberRequest, res: Response) => {
    const slug = String(req.params.slug);
    try {
        const ownsCheck = await pool.query(
            `SELECT p.access_type, p.access_value
             FROM purchases pu
             JOIN products p ON p.id = pu.product_id
             WHERE pu.customer_id = $1 AND p.slug = $2
               AND pu.revoked_at IS NULL AND p.is_published = true
             LIMIT 1`,
            [req.member!.customer_id, slug]
        );
        if ((ownsCheck.rowCount ?? 0) === 0) {
            return res.status(403).json({ error: 'Você não possui este produto' });
        }
        const row = ownsCheck.rows[0];
        if (row.access_type !== 'pdf' || !row.access_value) {
            return res.status(400).json({ error: 'Produto não tem arquivo direto' });
        }

        const downloadToken = signDownloadJwt({
            customer_id: req.member!.customer_id,
            product_slug: slug,
            kind: 'download',
        });

        // Verifica se existe um diretório de páginas pré-renderizadas (JPEG)
        const pagesDir = getPagesDir(row.access_value);
        const pageCount = await countPageImages(pagesDir);
        let pagesUrl: string | null = null;
        if (pageCount > 0) {
            const pagesToken = signDownloadJwt({
                customer_id: req.member!.customer_id,
                product_slug: slug,
                kind: 'pages',
            });
            pagesUrl = `/api/ebook/pages/${pagesToken}`;
        }

        res.json({
            url: `/api/ebook/download/${downloadToken}`,
            pages_url: pagesUrl,
            page_count: pageCount,
            expires_in: 1800,
        });
    } catch (err) {
        console.error('access-link error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve página individual como JPEG (imagem renderizada do PDF)
app.get('/api/ebook/pages/:token/:pageNum', async (req: Request, res: Response) => {
    const token = String(req.params.token || '');
    const pageNum = parseInt(String(req.params.pageNum || '0'), 10);
    const payload = verifyDownloadJwt(token, 'pages');
    if (!payload) {
        return res.status(401).send('Token inválido');
    }
    if (!Number.isFinite(pageNum) || pageNum < 1 || pageNum > 9999) {
        return res.status(400).send('Página inválida');
    }
    try {
        const ownsCheck = await pool.query(
            `SELECT p.access_type, p.access_value, pu.revoked_at
             FROM purchases pu
             JOIN products p ON p.id = pu.product_id
             WHERE pu.customer_id = $1 AND p.slug = $2 AND p.is_published = true
             LIMIT 1`,
            [payload.customer_id, payload.product_slug]
        );
        if ((ownsCheck.rowCount ?? 0) === 0) {
            return res.status(403).send('Acesso negado');
        }
        const row = ownsCheck.rows[0];
        if (row.revoked_at) return res.status(403).send('Acesso revogado');
        if (!row.access_value) return res.status(400).send('Produto sem arquivo');

        const pagesDir = getPagesDir(row.access_value);
        const padded = String(pageNum).padStart(2, '0');
        const filePath = path.join(pagesDir, `page-${padded}.jpg`);
        if (!filePath.startsWith(pagesDir)) {
            return res.status(400).send('Caminho inválido');
        }

        let stat: fs.Stats;
        try {
            stat = await fs.promises.stat(filePath);
        } catch {
            return res.status(404).send('Página não encontrada');
        }

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', String(stat.size));
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.setHeader('Accept-Ranges', 'none');
        const stream = fs.createReadStream(filePath);
        stream.on('error', (err) => {
            console.error('page stream error:', err);
            if (!res.headersSent) res.status(500).end();
        });
        stream.pipe(res);
    } catch (err) {
        console.error('page-image error:', err);
        if (!res.headersSent) res.status(500).send('Internal Server Error');
    }
});

// (2) Browser baixa direto via <a href> com o token na URL — não precisa de header
app.get('/api/ebook/download/:token', async (req: Request, res: Response) => {
    const token = String(req.params.token || '');
    const payload = verifyDownloadJwt(token);
    if (!payload) {
        return res.status(401).send('Link de download inválido ou expirado');
    }
    try {
        const ownsCheck = await pool.query(
            `SELECT p.access_type, p.access_value, pu.revoked_at
             FROM purchases pu
             JOIN products p ON p.id = pu.product_id
             WHERE pu.customer_id = $1 AND p.slug = $2 AND p.is_published = true
             LIMIT 1`,
            [payload.customer_id, payload.product_slug]
        );
        if ((ownsCheck.rowCount ?? 0) === 0) {
            return res.status(403).send('Acesso negado');
        }
        const row = ownsCheck.rows[0];
        if (row.revoked_at) {
            return res.status(403).send('Acesso revogado');
        }
        if (row.access_type !== 'pdf' || !row.access_value) {
            return res.status(400).send('Produto não tem arquivo direto');
        }

        const filePath = path.join(PRIVATE_ASSETS_DIR, row.access_value);
        if (!filePath.startsWith(PRIVATE_ASSETS_DIR)) {
            return res.status(400).send('Caminho inválido');
        }

        let stat: fs.Stats;
        try {
            stat = await fs.promises.stat(filePath);
        } catch {
            return res.status(404).send('Arquivo não encontrado');
        }

        // Atualiza estatística de acesso
        await pool.query(
            `UPDATE purchases SET last_accessed_at = now(), access_count = access_count + 1
             WHERE customer_id = $1 AND product_id = (SELECT id FROM products WHERE slug = $2)`,
            [payload.customer_id, payload.product_slug]
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', String(stat.size));
        res.setHeader('Content-Disposition', `inline; filename="${payload.product_slug}.pdf"`);
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Accept-Ranges', 'none');

        const stream = fs.createReadStream(filePath);
        stream.on('error', (err) => {
            console.error('stream error:', err);
            if (!res.headersSent) res.status(500).end();
        });
        stream.pipe(res);
    } catch (err) {
        console.error('download error:', err);
        if (!res.headersSent) res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`BizGuardian CRM API running on port ${port}`);
    console.log(`Stripe mode: ${(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
});
