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
