/**
 * Add `language` column to User and EmailSubscriber so transactional emails
 * can be sent in the language the user chose at signup. Idempotent.
 */
import { prisma } from '../lib/prisma';

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "EmailSubscriber"
    ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
  `);

  const u = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "User" WHERE "language" = 'en'`
  );
  const s = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int AS c FROM "EmailSubscriber" WHERE "language" = 'en'`
  );
  console.log(`✅ User.language and EmailSubscriber.language ready.`);
  console.log(`   Users defaulted to 'en': ${u[0].c}, subscribers: ${s[0].c}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
