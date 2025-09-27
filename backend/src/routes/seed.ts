import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import { prisma } from '../prismaClient';

const router = Router();

/**
 * POST /api/seed/admin
 * Header: x-seed-secret: <ADMIN_SEED_SECRET>
 */
router.post('/admin', async (req: Request, res: Response) => {
  const secret = req.headers['x-seed-secret'];
  if (!secret || secret !== (process.env.ADMIN_SEED_SECRET || '')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const email = 'admin@oficioscerca.local';
  const password = 'Admin123!';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return res.json({ ok: true, note: 'admin_exists', email });
  }

  const passwordHash = await argon2.hash(password);
  await prisma.adminUser.create({
    data: { email, passwordHash }
  });

  res.json({ ok: true, created: { email, password } });
});

export default router;
