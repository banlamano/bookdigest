import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all books with filters and pagination
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isPremium,
      language = 'en',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { isPublished: 1, language };

    if (category) where.categoryId = category;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: order },
        include: {
          category: true,
          _count: {
            select: { favorites: true, reviews: true }
          }
        },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        books,
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

// Get featured books
export const getFeaturedBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await prisma.book.findMany({
      where: { isFeatured: 1, isPublished: 1 },
      take: 10,
      orderBy: { rating: 'desc' },
      include: {
        category: true,
      },
    });

    res.json({
      status: 'success',
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

// Get book by ID
export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { favorites: true, reviews: true }
        }
      },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if premium book and user is not authenticated
    if (book.isPremium && !req.user) {
      // Return limited data
      const limitedBook = {
        ...book,
        summary: book.summary.substring(0, 200) + '...',
        keyInsights: [],
        chapters: [],
        audioUrl: null,
      };
      return res.json({
        status: 'success',
        data: { book: limitedBook, requiresPremium: true },
      });
    }

    res.json({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Search books
export const searchBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const searchTerm = String(q).toLowerCase();

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          isPublished: 1,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { author: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ],
        },
        skip,
        take: Number(limit),
        include: {
          category: true,
        },
      }),
      prisma.book.count({
        where: {
          isPublished: 1,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { author: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ],
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        books,
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

// Toggle favorite
export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_bookId: { userId, bookId: id },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return res.json({
        status: 'success',
        data: { isFavorite: false },
      });
    }

    await prisma.favorite.create({
      data: { userId, bookId: id },
    });

    res.json({
      status: 'success',
      data: { isFavorite: true },
    });
  } catch (error) {
    next(error);
  }
};

// Get user favorites
export const getUserFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { favorites: favorites.map(f => f.book) },
    });
  } catch (error) {
    next(error);
  }
};

// Update reading progress
export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { progress, currentChapter, audioProgress, timeSpent, isCompleted } = req.body;

    const readingProgress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: { userId, bookId: id },
      },
      update: {
        progress,
        currentChapter,
        audioProgress,
        timeSpent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        bookId: id,
        progress,
        currentChapter,
        audioProgress,
        timeSpent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Update user stats if book completed
    if (isCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          booksRead: { increment: 1 },
          totalReadingTime: { increment: timeSpent },
        },
      });
    }

    res.json({
      status: 'success',
      data: { progress: readingProgress },
    });
  } catch (error) {
    next(error);
  }
};

// Get book progress
export const getBookProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: { userId, bookId: id },
      },
    });

    res.json({
      status: 'success',
      data: { progress: progress || null },
    });
  } catch (error) {
    next(error);
  }
};

// Add review
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const review = await prisma.review.upsert({
      where: {
        userId_bookId: { userId, bookId: id },
      },
      update: { rating, comment },
      create: { userId, bookId: id, rating, comment },
    });

    // Update book rating
    const reviews = await prisma.review.findMany({
      where: { bookId: id },
    });

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.book.update({
      where: { id },
      data: {
        rating: avgRating,
        ratingsCount: reviews.length,
      },
    });

    res.json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// Get book reviews
export const getBookReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { bookId: id, isPublic: true },
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { bookId: id, isPublic: true } }),
    ]);

    res.json({
      status: 'success',
      data: {
        reviews,
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
