/**
 * One-shot DDL: create the EmailSubscriber table directly via raw SQL.
 * Used because `prisma db push` was hanging silently on Windows/git-bash.
 *
 * Safe to re-run — uses IF NOT EXISTS everywhere.
 */
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Creating EmailSubscriber table...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EmailSubscriber" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "source" TEXT,
      "confirmedAt" TIMESTAMP(3),
      "unsubscribedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "EmailSubscriber_email_key"
      ON "EmailSubscriber"("email");
  `);

  const count = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
    `SELECT COUNT(*)::int AS c FROM "EmailSubscriber"`
  );
  console.log(`✅ EmailSubscriber table ready. Current rows: ${count[0].c}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
