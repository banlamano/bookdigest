/**
 * One-shot backfill: walk every existing user and call evaluateAndAward
 * so anyone who already meets a criterion gets the corresponding badge.
 * Safe to re-run — the service is idempotent (skips already-unlocked rows).
 *
 * Run with: npx tsx src/scripts/backfill-achievements.ts
 */
import { prisma } from '../lib/prisma';
import { evaluateAndAward } from '../services/achievements.service';

async function backfill() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, booksRead: true, longestStreak: true, totalReadingTime: true },
  });

  console.log(`Evaluating ${users.length} users…\n`);

  let usersAwardedSomething = 0;
  let totalUnlocks = 0;
  const breakdown: Record<string, number> = {};

  for (const u of users) {
    const newly = await evaluateAndAward(u.id);
    if (newly.length > 0) {
      usersAwardedSomething += 1;
      totalUnlocks += newly.length;
      const names = newly.map(a => a.name).join(', ');
      console.log(`  ${u.email}: +${newly.length} (${names})`);
      for (const a of newly) {
        breakdown[a.name] = (breakdown[a.name] ?? 0) + 1;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Users touched:   ${users.length}`);
  console.log(`Users awarded:   ${usersAwardedSomething}`);
  console.log(`Total unlocks:   ${totalUnlocks}`);
  if (Object.keys(breakdown).length > 0) {
    console.log(`\nPer-achievement:`);
    for (const [name, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${name.padEnd(22)} ${count}`);
    }
  }
  await prisma.$disconnect();
}

backfill().catch(err => {
  console.error('Backfill failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
