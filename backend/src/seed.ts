import 'dotenv/config';
import argon2 from 'argon2';
import { prisma } from './prismaClient';

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@oficioscerca.local';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const hash = await argon2.hash(adminPass);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash },
    create: { email: adminEmail, passwordHash: hash }
  });
  console.log(`Admin seeded: ${adminEmail} / ${adminPass}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });