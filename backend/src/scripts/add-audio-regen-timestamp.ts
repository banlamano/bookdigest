/**
 * Add Book.audioRegeneratedAt and backfill it for any book whose audio
 * has already been refreshed with the full-content composer.
 *
 * Heuristic for backfill: full-content audio is ~5-7× longer than summary-
 * only audio (~5 min vs ~25-40 min). Anything with audioDuration > 600s
 * (10 min) is assumed to already use the new composer. Currently only
 * Atomic Habits qualifies (regenerated as the test sample).
 *
 * Idempotent — safe to re-run.
 */
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Adding Book.audioRegeneratedAt column...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Book"
    ADD COLUMN IF NOT EXISTS "audioRegeneratedAt" TIMESTAMP(3);
  `);

  // Backfill: anything with audioDuration > 600 (10 min) is full-composer.
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Book"
    SET "audioRegeneratedAt" = COALESCE("audioRegeneratedAt", "updatedAt")
    WHERE "audioUrl" LIKE '%.r2.dev/audio/%'
      AND "audioDuration" IS NOT NULL
      AND "audioDuration" > 600;
  `);

  console.log(`✅ Column ready. Backfilled ${result} row(s) as already-regenerated.`);

  const total = await prisma.book.count({
    where: { audioUrl: { contains: '.r2.dev/audio/' } },
  });
  const done = await prisma.book.count({
    where: { audioUrl: { contains: '.r2.dev/audio/' }, audioRegeneratedAt: { not: null } },
  });
  console.log(`   Books with R2 audio: ${total}. Refreshed with full composer: ${done}. Pending: ${total - done}.`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
