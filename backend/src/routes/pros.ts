import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

function safeParseTags(str?: string | null): string[] {
  if (!str) return [];
  try { const v = JSON.parse(str); return Array.isArray(v) ? v : []; }
  catch { return []; }
}

/**
 * Público: GET /api/pros?q=&category=&city=
 * Devuelve solo status = 'approved'
 */
router.get('/', async (req: Request, res: Response) => {
  const q = (req.query.q || '').toString().toLowerCase();
  const category = (req.query.category || '').toString();
  const city = (req.query.city || '').toString().toLowerCase();

  const rows = await prisma.professional.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' }
  });

  const filtered = rows
    .filter(p => {
      const tags = safeParseTags(p.tags || undefined);
      const hayQ = !q || [p.name, p.category, p.city, p.bio, JSON.stringify(tags)]
        .join(' ').toLowerCase().includes(q);
      const hayCat = !category || p.category === category;
      const hayCity = !city || (p.city || '').toLowerCase().includes(city);
      return hayQ && hayCat && hayCity;
    })
    .map(p => ({ ...p, tags: safeParseTags(p.tags || undefined) }));

  res.json(filtered);
});

/** Público: GET /api/pros/:id */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = await prisma.professional.findUnique({ where: { id } });
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json({ ...p, tags: safeParseTags(p.tags || undefined) });
});

/** Público: POST /api/pros (crea 'pending') */
const createSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  city: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  bio: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional()
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await prisma.professional.create({
      data: {
        name: parsed.name,
        category: parsed.category,
        city: parsed.city,
        phone: parsed.phone,
        email: parsed.email || null,
        bio: parsed.bio || null,
        tags: JSON.stringify(parsed.tags || []), // SQLite: guardamos como string
        status: 'pending'
      }
    });
    res.status(201).json({ id: created.id, status: created.status });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'invalid_payload', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

/** Admin: listar pendientes */
router.get('/admin/pending', authMiddleware, async (_req: Request, res: Response) => {
  const rows = await prisma.professional.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' }
  });
  res.json(rows);
});

/** Admin: listar aprobados (para poder ocultar/eliminar ya publicados) */
router.get('/admin/approved', authMiddleware, async (_req: Request, res: Response) => {
  const rows = await prisma.professional.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' }
  });
  res.json(rows);
});

/** Admin: actualizar estado ('approved' | 'rejected' | 'pending' | 'deleted') */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const status = (req.body.status || '').toString();
  if (!['approved','rejected','pending','deleted'].includes(status)) {
    return res.status(400).json({ error: 'bad_status' });
  }
  const updated = await prisma.professional.update({ where: { id }, data: { status } });
  res.json({ id: updated.id, status: updated.status });
});

/** Admin: eliminar (soft-delete -> status='deleted') */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const found = await prisma.professional.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'not_found' });

  const updated = await prisma.professional.update({
    where: { id },
    data: { status: 'deleted' }
  });
  res.json({ id: updated.id, status: updated.status });
});

export default router;
