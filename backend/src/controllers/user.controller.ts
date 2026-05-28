import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        booksRead: true,
        totalReadingTime: true,
        currentStreak: true,
        longestStreak: true,
        subscriptionType: true,
      },
    });

    const [inProgress, favorites, achievements] = await Promise.all([
      prisma.readingProgress.count({
        where: { userId, isCompleted: 0 },
      }),
      prisma.favorite.count({ where: { userId } }),
      prisma.userAchievement.count({ where: { userId } }),
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          ...user,
          inProgress,
          favorites,
          achievements,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return every achievement in the catalog with the user's current state
 * for each one: locked vs. unlocked, unlock date if applicable, and the
 * numeric progress toward the threshold (so the UI can render progress bars
 * for locked items).
 */
export const getAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [user, achievements, userAchievements, distinctCategories] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          booksRead: true,
          currentStreak: true,
          longestStreak: true,
          totalReadingTime: true,
        },
      }),
      prisma.achievement.findMany({ orderBy: { points: 'asc' } }),
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.readingHistory.findMany({
        where: { userId, completed: 1 },
        select: { book: { select: { categoryId: true } } },
      }),
    ]);

    const unlockedMap = new Map(userAchievements.map(u => [u.achievementId, u.unlockedAt]));
    const bestStreak = Math.max(user?.longestStreak ?? 0, user?.currentStreak ?? 0);
    const distinctCount = new Set(distinctCategories.map(r => r.book.categoryId)).size;

    const result = achievements.map(a => {
      const currentValue =
        a.criteriaType === 'BOOKS_READ'   ? (user?.booksRead ?? 0) :
        a.criteriaType === 'STREAK'       ? bestStreak :
        a.criteriaType === 'TIME_MINUTES' ? (user?.totalReadingTime ?? 0) :
        a.criteriaType === 'CATEGORIES'   ? distinctCount :
        0;
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        points: a.points,
        criteriaType: a.criteriaType,
        criteriaValue: a.criteriaValue,
        unlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) ?? null,
        progress: { current: Math.min(currentValue, a.criteriaValue), target: a.criteriaValue },
      };
    });

    const totalPoints = result
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    res.json({
      status: 'success',
      data: {
        achievements: result,
        totalPoints,
        unlockedCount: result.filter(a => a.unlocked).length,
        totalCount: result.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReadingHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [history, total] = await Promise.all([
      prisma.readingHistory.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        include: {
          book: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingHistory.count({ where: { userId } }),
    ]);

    res.json({
      status: 'success',
      data: {
        history,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
