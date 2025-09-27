import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { prisma } from './prismaClient';
import authRoutes from './routes/auth';
import prosRoutes from './routes/pros';

const app = express();
app.use(express.json());

// CORS
const allowed = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pros', prosRoutes);

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
