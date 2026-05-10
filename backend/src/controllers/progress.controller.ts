import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bookId } = req.params;
    const { progress, currentChapter, audioProgress, timeSpent, isCompleted } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

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

    // If completed, add to reading history
    if (isCompleted) {
      await prisma.readingHistory.create({
        data: {
          userId,
          bookId,
          duration: timeSpent || 0,
          completed: 1,
        },
      });

      // Update user stats
      await prisma.user.update({
        where: { id: userId },
        data: {
          booksRead: { increment: 1 },
          totalReadingTime: { increment: timeSpent || 0 },
          lastReadDate: new Date(),
        },
      });
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
