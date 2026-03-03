import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS whitelist config
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Set up Postgres Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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

app.listen(port, () => {
    console.log(`BizGuardian CRM API running on port ${port}`);
});
