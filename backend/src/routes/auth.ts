import { Router } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../prismaClient';
import 'dotenv/config';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.json({ token });
});

export default router;