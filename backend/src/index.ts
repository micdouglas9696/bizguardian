import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS whitelist config
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true
}));

app.use(express.json());

// Set up Postgres Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

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

// Endpoints for Data Ingestion (Public)
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
            transporter.sendMail({
                from: `"Marinho Ponci" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: `Seu Diagnóstico de Maturidade para Franchising — ${getOutcomeForScore(score).title}`,
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

// Endpoints for Dashboard (Protected)
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

app.listen(port, () => {
    console.log(`BizGuardian CRM API running on port ${port}`);
});
