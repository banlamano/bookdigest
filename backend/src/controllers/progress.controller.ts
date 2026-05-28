import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';
import { FREE_TIER_LIMIT } from '../middleware/freemium.middleware';
import { evaluateAndAward } from '../services/achievements.service';

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;
    const { progress, currentChapter, audioProgress, timeSpent, isCompleted } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Detect whether this call is creating a NEW reading-progress entry — used
    // below to fire the "limit reached" upgrade email when a free user starts
    // their 3rd book this month.
    const existingProgress = await prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { id: true },
    });
    const isNewBook = !existingProgress;

    // Update or create progress
    const progressRecord = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      update: {
        progress: progress ?? undefined,
        currentChapter: currentChapter ?? undefined,
        audioProgress: audioProgress ?? undefined,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        isCompleted: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : undefined,
      },
      create: {
        userId,
        bookId,
        progress: progress || 0,
        currentChapter: currentChapter || 0,
        audioProgress: audioProgress || 0,
        timeSpent: timeSpent || 0,
        isCompleted: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    // When a free user starts their 3rd book this month, fire the upgrade
    // email exactly once. Skip premium users and books they've started before.
    if (isNewBook) {
      void sendLimitReachedEmailIfEligible(userId).catch(err =>
        console.error('Failed to send limit-reached email:', err)
      );
    }

    // If completed, add to reading history + update stats + recompute streak.
    if (isCompleted) {
      await prisma.readingHistory.create({
        data: {
          userId,
          bookId,
          duration: timeSpent || 0,
          completed: 1,
        },
      });

      const { currentStreak, longestStreak, previousStreak } =
        await computeUpdatedStreak(userId);

      await prisma.user.update({
        where: { id: userId },
        data: {
          booksRead: { increment: 1 },
          totalReadingTime: { increment: timeSpent || 0 },
          lastReadDate: new Date(),
          currentStreak,
          longestStreak,
        },
      });

      // Fire milestone email if the user just crossed 3/7/30/100 days.
      // Crossing means previousStreak < N AND currentStreak === N — this
      // can only happen on the day the streak increments to N (the
      // diffDays===0 same-day branch keeps currentStreak unchanged, so
      // multiple books on milestone day don't re-fire).
      const MILESTONES = [3, 7, 30, 100];
      if (MILESTONES.includes(currentStreak) && previousStreak < currentStreak) {
        void sendStreakMilestoneIfEligible(userId, currentStreak).catch(err =>
          console.error('Failed to send streak milestone email:', err)
        );
      }

      // Evaluate achievements after the user row reflects the new stats.
      // Fire-and-forget — never block the response on award logic.
      void evaluateAndAward(userId).catch(err =>
        console.error('Achievement evaluation failed:', err)
      );
    }

    res.json({
      success: true,
      data: progressRecord,
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compute the user's reading streak based on their previous lastReadDate.
 * Streak logic (counts consecutive calendar days with at least one completed book):
 *   - Already read today → no change
 *   - Last read was yesterday → currentStreak += 1
 *   - Last read >1 day ago (or never) → currentStreak = 1 (reset, today counts)
 * longestStreak is bumped if the new currentStreak exceeds it.
 */
async function computeUpdatedStreak(
  userId: string
): Promise<{ currentStreak: number; longestStreak: number; previousStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastReadDate: true },
  });
  if (!user) return { currentStreak: 1, longestStreak: 1, previousStreak: 0 };

  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const today = startOfDay(new Date());
  const last = user.lastReadDate ? startOfDay(user.lastReadDate) : null;

  const previousStreak = user.currentStreak ?? 0;
  let currentStreak = previousStreak;
  if (!last) {
    currentStreak = 1;
  } else {
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
    if (diffDays === 0) {
      // Already counted today — keep current streak as-is. First book of the day
      // started it; this is the Nth book of the same day.
      currentStreak = Math.max(currentStreak, 1);
    } else if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1; // gap broke the streak; today re-starts it
    }
  }
  const longestStreak = Math.max(user.longestStreak ?? 0, currentStreak);
  return { currentStreak, longestStreak, previousStreak };
}

/**
 * Send the streak milestone email if the user is reachable. Wrapped in its own
 * helper to keep the trigger site in updateProgress short and so failures here
 * don't break the response. Premium status doesn't matter — milestones are a
 * universal retention loop.
 */
async function sendStreakMilestoneIfEligible(userId: string, days: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });
  if (!user) return;
  await EmailService.sendStreakMilestone(
    { email: user.email, firstName: user.firstName || 'there' },
    days
  );
}

/**
 * Send the freemium limit-reached upgrade email if (and only if) the user has
 * just started their 3rd book this month while still on the FREE tier. Premium
 * users are skipped. Fires exactly once at the transition (count === LIMIT),
 * so the user doesn't get a duplicate if they revisit reading another month.
 */
async function sendLimitReachedEmailIfEligible(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      subscriptionType: true,
      subscriptionEnd: true,
    },
  });
  if (!user) return;

  const isPremiumActive =
    user.subscriptionType !== 'FREE' &&
    (!user.subscriptionEnd || new Date(user.subscriptionEnd) > new Date());
  if (isPremiumActive) return;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthCount = await prisma.readingProgress.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  // Only at the exact moment the limit is reached. Subsequent book attempts
  // this month are blocked by checkFreemiumLimit middleware before they create
  // a new ReadingProgress row, so this condition can only be true once per month.
  if (thisMonthCount !== FREE_TIER_LIMIT) return;

  await EmailService.sendFreeTierLimitReached({
    email: user.email,
    firstName: user.firstName || 'there',
  });
}

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const progressList = await prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: progressList,
    });
  } catch (error: any) {
    console.error('Get user progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        bookId,
      },
    });

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Favorite removed',
    });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: favorites.map(f => f.book),
    });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReadingHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const history = await prisma.readingHistory.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Get reading history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
