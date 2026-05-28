import { prisma } from '../lib/prisma';

/**
 * Achievement evaluation + awarding.
 *
 * Single entry point: `evaluateAndAward(userId)`. Call after any event that
 * could change a user's eligibility (book completed, streak updated, etc.).
 * The function reads current user stats, walks every Achievement row, and
 * inserts a UserAchievement for each newly-met criterion. Already-unlocked
 * achievements are skipped via the @@unique([userId, achievementId])
 * constraint on UserAchievement (caught and ignored).
 *
 * Returns the list of NEWLY unlocked achievements so callers can surface
 * them (e.g., toast notifications, congratulations emails). Failures are
 * swallowed and logged — never let achievement awarding break the parent
 * request.
 */

type CriteriaType = 'BOOKS_READ' | 'STREAK' | 'TIME_MINUTES' | 'CATEGORIES';

export type UnlockedAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
};

export async function evaluateAndAward(userId: string): Promise<UnlockedAchievement[]> {
  try {
    const [user, distinctCategoryCount, achievements, alreadyUnlocked] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          booksRead: true,
          currentStreak: true,
          longestStreak: true,
          totalReadingTime: true,
        },
      }),
      countDistinctCategoriesRead(userId),
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
    ]);
    if (!user) return [];

    const alreadyUnlockedIds = new Set(alreadyUnlocked.map(u => u.achievementId));
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const a of achievements) {
      if (alreadyUnlockedIds.has(a.id)) continue;
      const met = isCriterionMet(a.criteriaType as CriteriaType, a.criteriaValue, {
        booksRead: user.booksRead,
        // STREAK rewards "best ever" — using longestStreak lets users keep
        // the badge even if they later break the streak (otherwise the
        // achievement would feel revocable, which is bad UX).
        bestStreak: Math.max(user.longestStreak, user.currentStreak),
        totalMinutes: user.totalReadingTime,
        distinctCategories: distinctCategoryCount,
      });
      if (!met) continue;

      try {
        await prisma.userAchievement.create({
          data: { userId, achievementId: a.id },
        });
        newlyUnlocked.push({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          points: a.points,
        });
      } catch (err: any) {
        // P2002 = unique constraint — race with a concurrent request. Safe to ignore.
        if (err.code !== 'P2002') {
          console.error(`Failed to award achievement ${a.name} to ${userId}:`, err.message);
        }
      }
    }

    return newlyUnlocked;
  } catch (err) {
    console.error('evaluateAndAward failed:', err);
    return [];
  }
}

function isCriterionMet(
  type: CriteriaType,
  threshold: number,
  stats: { booksRead: number; bestStreak: number; totalMinutes: number; distinctCategories: number }
): boolean {
  switch (type) {
    case 'BOOKS_READ':   return stats.booksRead >= threshold;
    case 'STREAK':       return stats.bestStreak >= threshold;
    case 'TIME_MINUTES': return stats.totalMinutes >= threshold;
    case 'CATEGORIES':   return stats.distinctCategories >= threshold;
    default:             return false;
  }
}

async function countDistinctCategoriesRead(userId: string): Promise<number> {
  // ReadingHistory rows are immutable per-completion log entries; counting
  // distinct categories there gives the right answer even if a book is
  // re-read or a ReadingProgress row is mutated.
  const rows = await prisma.readingHistory.findMany({
    where: { userId, completed: 1 },
    select: { book: { select: { categoryId: true } } },
  });
  const set = new Set(rows.map(r => r.book.categoryId));
  return set.size;
}
