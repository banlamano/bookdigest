/**
 * Seed the Achievement catalog. Idempotent — runs upsert on the `name`
 * unique key, so re-running won't duplicate rows. Safe to ship to prod.
 *
 * Run with: npx tsx src/scripts/seed-achievements.ts
 */
import { prisma } from '../lib/prisma';

type AchievementSeed = {
  name: string;
  description: string;
  icon: string; // single emoji used in UI; small enough to embed inline
  points: number;
  criteriaType: 'BOOKS_READ' | 'STREAK' | 'TIME_MINUTES' | 'CATEGORIES';
  criteriaValue: number;
};

const ACHIEVEMENTS: AchievementSeed[] = [
  // BOOKS_READ tier
  { name: 'First Steps',       description: 'Finish your first book summary.',         icon: '🌱', points: 10,   criteriaType: 'BOOKS_READ',    criteriaValue: 1 },
  { name: 'Bookworm',          description: 'Finish 5 book summaries.',                icon: '📚', points: 50,   criteriaType: 'BOOKS_READ',    criteriaValue: 5 },
  { name: 'Voracious Reader',  description: 'Finish 10 book summaries.',               icon: '🐛', points: 100,  criteriaType: 'BOOKS_READ',    criteriaValue: 10 },
  { name: 'Bibliophile',       description: 'Finish 25 book summaries.',               icon: '🦉', points: 250,  criteriaType: 'BOOKS_READ',    criteriaValue: 25 },
  { name: 'Library Legend',    description: 'Finish 50 book summaries.',               icon: '🏛️', points: 500,  criteriaType: 'BOOKS_READ',    criteriaValue: 50 },

  // STREAK tier
  { name: 'Momentum',          description: 'Read on 3 consecutive days.',             icon: '🔥', points: 25,   criteriaType: 'STREAK',        criteriaValue: 3 },
  { name: 'One Week Strong',   description: 'Read on 7 consecutive days.',             icon: '⚡', points: 75,   criteriaType: 'STREAK',        criteriaValue: 7 },
  { name: 'Unstoppable',       description: 'Read on 30 consecutive days.',            icon: '🚀', points: 300,  criteriaType: 'STREAK',        criteriaValue: 30 },
  { name: 'Reading Machine',   description: 'Read on 100 consecutive days.',           icon: '🏆', points: 1000, criteriaType: 'STREAK',        criteriaValue: 100 },

  // TIME_MINUTES tier
  { name: 'Time Invested',     description: 'Log 5 hours of total reading time.',      icon: '⏱️', points: 50,   criteriaType: 'TIME_MINUTES',  criteriaValue: 300 },
  { name: 'Marathon',          description: 'Log 20 hours of total reading time.',     icon: '🏃', points: 150,  criteriaType: 'TIME_MINUTES',  criteriaValue: 1200 },

  // CATEGORIES tier
  { name: 'Category Explorer', description: 'Read books across 5 different categories.', icon: '🗺️', points: 100, criteriaType: 'CATEGORIES',  criteriaValue: 5 },
];

async function seed() {
  console.log(`Seeding ${ACHIEVEMENTS.length} achievements…`);
  let created = 0;
  let updated = 0;
  for (const a of ACHIEVEMENTS) {
    const existing = await prisma.achievement.findUnique({ where: { name: a.name } });
    if (existing) {
      await prisma.achievement.update({
        where: { name: a.name },
        data: a,
      });
      updated += 1;
    } else {
      await prisma.achievement.create({ data: a });
      created += 1;
    }
  }
  console.log(`✅ ${created} created, ${updated} updated.`);
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
