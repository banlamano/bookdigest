import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { getFreemiumStatus } from '../middleware/freemium.middleware';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Helper function to check if user has premium access
async function checkPremiumAccess(userId: string | undefined, bookIsPremium: number): Promise<boolean> {
  // If book is not premium, everyone has access
  if (!bookIsPremium) return true;
  
  // If user is not authenticated, no access
  if (!userId) return false;
  
  // Check user's subscription status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionType: true, subscriptionEnd: true },
  });
  
  if (!user) return false;
  
  // Check if user has active premium subscription
  const isPremiumUser = user.subscriptionType !== 'FREE';
  // If no expiration date is set, treat as lifetime premium
  if (isPremiumUser && !user.subscriptionEnd) return true;

  const subscriptionActive = user.subscriptionEnd ? new Date(user.subscriptionEnd) > new Date() : false;
  
  return isPremiumUser && subscriptionActive;
}

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
    const where: any = {};
    
    // For German users, show both English and German books since the German library is still growing
    if (language === 'de') {
      where.language = { in: ['en', 'de'] };
    } else if (language && language !== 'all') {
      where.language = language;
    }

    if (category) where.categoryId = category;
    // Note: isPremium column removed from schema - all books are accessible based on user subscription

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

    // Cache headers (short TTL so newly imported covers/descriptions show up quickly)
    // NOTE: keep TTL low while we are actively updating book metadata.
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');

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
      take: 10,
      orderBy: { rating: 'desc' },
      include: {
        category: true,
      },
    });

    // Cache headers (short TTL while metadata is being updated)
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    
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
    const userId = req.user?.userId; // User may or may not be authenticated

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

    // If user is not authenticated, return public book data only
    // Product Hunt / marketing: allow one or more public demo books to show full content
    // Set env var: PUBLIC_DEMO_BOOK_IDS="id1,id2" (commas) or PUBLIC_DEMO_BOOK_ID="id"
    const demoIdsRaw = process.env.PUBLIC_DEMO_BOOK_IDS || process.env.PUBLIC_DEMO_BOOK_ID || '';
    // Render/UIs sometimes wrap env values in quotes. Also guard against whitespace/newlines.
    const normalizeDemoId = (value: string) => value.trim().replace(/^["']+|["']+$/g, '');
    const demoIds = demoIdsRaw
      .split(',')
      .map(normalizeDemoId)
      .filter(Boolean);
    const isPublicDemo = demoIds.includes(id);

    // Public demo books should always be readable (marketing), even if the user is logged in
    // and has hit their monthly free limit. Also, we should not count demo views towards limits.
    if (isPublicDemo) {
      logger.info(`Public demo book access: ${id} (userId=${userId || 'anonymous'})`);
      return res.json({
        status: 'success',
        data: {
          book,
          isPublicDemo: true,
        },
      });
    }

    if (!userId) {
      // Return basic book info without tracking or premium content
      // Keep audioUrl to show the feature and drive signups
      const publicBook = {
        ...book,
        audioUrl: book.audioUrl, // Show audio feature to drive conversions
        summary: (book.summary || '').substring(0, 500) + '...', // Truncate summary (null-safe)
        keyInsights: [], // Hide insights
        chapters: [], // Hide chapters
        quotes: [], // Hide quotes
        actionItems: [], // Hide action items
      };

      return res.json({
        status: 'success',
        data: {
          book: publicBook,
          requiresAuth: true,
          message: 'Login to access full content'
        },
      });
    }

    // CRITICAL: Track book access for freemium limit enforcement
    // Check if user has already accessed this book this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const existingProgress = await prisma.readingProgress.findFirst({
      where: {
        userId,
        bookId: id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // If this is a new book access this month, create a progress record
    if (!existingProgress) {
      await prisma.readingProgress.create({
        data: {
          userId,
          bookId: id,
          progress: 0,
          currentChapter: 0,
          timeSpent: 0,
          isCompleted: 0,
        },
      });
    }

    // Get user's freemium status (after tracking access)
    const freemiumStatus = await getFreemiumStatus(userId);
    
    // Check freemium limits for free users
    if (!freemiumStatus.isPremium && freemiumStatus.remaining <= 0) {
      throw new AppError(
        `Free tier limit reached. You've read ${freemiumStatus.used} books this month. Upgrade to Premium for unlimited access.`,
        403
      );
    }
    
    // Check if user has premium access
    const isPremiumUser = freemiumStatus.isPremium;
    
    // Premium content restrictions for free users
    if (!isPremiumUser) {
      // Keep audioUrl visible to show the feature (UX improvement for conversions)
      // Frontend will handle showing upgrade prompt for free users
      return res.json({
        status: 'success',
        data: { 
          book, // Return full book data including audioUrl
          freemiumStatus: {
            isPremium: false,
            booksRemaining: freemiumStatus.remaining,
            booksRead: freemiumStatus.used,
            limit: freemiumStatus.limit
          }
        },
      });
    }

    // Premium users get everything
    res.json({
      status: 'success',
      data: { 
        book,
        freemiumStatus: {
          isPremium: true,
          unlimited: true
        }
      },
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
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { author: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { contains: searchTerm, mode: 'insensitive' } },
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
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { author: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { contains: searchTerm, mode: 'insensitive' } },
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
        isCompleted: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        bookId: id,
        progress,
        currentChapter,
        audioProgress,
        timeSpent,
        isCompleted: isCompleted ? 1 : 0,
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
        where: { bookId: id, isPublic: 1 },
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
      prisma.review.count({ where: { bookId: id, isPublic: 1 } }),
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
