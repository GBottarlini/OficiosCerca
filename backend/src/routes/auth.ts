import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../prismaClient';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const email = (req.body?.email || '').toString().trim();
  const password = (req.body?.password || '').toString();

  if (!email || !password) {
    return res.status(400).json({ error: 'missing_credentials' });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const secret = process.env.JWT_SECRET || 'devsecret';
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' });

  res.json({ token });
});

export default router;
