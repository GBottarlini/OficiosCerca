import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import prosRouter from './routes/pros';
import authRouter from './routes/auth';

const app = express();
app.use(helmet());
app.use(express.json());

const allowed = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));

app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/pros', prosRouter);
app.use('/api/auth', authRouter);

const port = Number(process.env.PORT || 10000);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});