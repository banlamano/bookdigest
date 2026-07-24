import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { getFreemiumStatus } from '../middleware/freemium.middleware';
import { logger } from '../utils/logger';

// Get all books with filters and pagination
// Slugs only, for the frontend sitemap.
//
// The sitemap used to call /api/books?limit=2000&language=all, which returns
// every book with its full summary and chapter content: ~28 MB and ~13 s on a
// warm backend. On a cold Render instance that overran the frontend's fetch
// timeout, and the sitemap then silently shipped without a single book URL.
// This returns the same rows at ~1% of the payload.
export const getBookSlugs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await prisma.book.findMany({
      select: { id: true, slug: true, title: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

    res.json({
      status: 'success',
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

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
    
    // Filter by language
    if (language && language !== 'all') {
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
    const { language = 'en' } = req.query;
    
    const books = await prisma.book.findMany({
      where: {
        language: language as string
      },
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
    const { id: identifier } = req.params;
    const userId = req.user?.userId; // User may or may not be authenticated

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    const whereClause = isUuid ? { id: identifier } : { slug: identifier };

    const bookFound = await prisma.book.findUnique({
      where: whereClause,
      include: {
        category: true,
        _count: {
          select: { favorites: true, reviews: true }
        }
      },
    });

    // If not found and identifier is not a UUID, try partial slug match (handles short German slugs without '-zusammenfassung-<id>')
    let finalBook = bookFound;
    if (!finalBook && !isUuid) {
      finalBook = await prisma.book.findFirst({
        where: { slug: { startsWith: identifier } },
        include: {
          category: true,
          _count: { select: { favorites: true, reviews: true } }
        }
      });
    }

    if (!finalBook) {
      throw new AppError('Book not found', 404);
    }

    const book = finalBook;

    // Find alternate language version to enable automatic language switching
    // AND power hreflang tags in the page metadata (SEO).
    const { language: preferredLang } = req.query;
    let alternateVersionId: string | null = null;
    let alternateSlug: string | null = null;

    async function findAlternate(otherLang: 'en' | 'de') {
      if (otherLang === 'de') {
        return prisma.book.findFirst({
          where: { language: 'de', originalTitle: book.title },
          select: { id: true, slug: true }
        });
      }
      return prisma.book.findFirst({
        where: { language: 'en', title: book.originalTitle || book.title },
        select: { id: true, slug: true }
      });
    }

    const otherLang = book.language === 'en' ? 'de' : 'en';
    const alternate = await findAlternate(otherLang);
    if (alternate) {
      alternateVersionId = alternate.id;
      alternateSlug = alternate.slug;
    }
    // (preferredLang handling preserved by client — book is returned matching `preferredLang`
    // if available, then the auto-switch hook uses alternateVersionId on the client.)
    void preferredLang;

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
    const isPublicDemo = demoIds.includes(book.id);

    // Public demo books should always be readable (marketing), even if the user is logged in
    // and has hit their monthly free limit. Also, we should not count demo views towards limits.
    if (isPublicDemo) {
      logger.info(`Public demo book access: ${book.id} (userId=${userId || 'anonymous'})`);
      return res.json({
        status: 'success',
        data: {
          book,
          isPublicDemo: true,
          alternateVersionId,
          alternateSlug,
        },
      });
    }

    if (!userId) {
      // Return basic book info without tracking or premium content
      // Keep audioUrl to show the feature and drive signups
      const publicBook = {
        ...book,
        audioUrl: book.audioUrl, // Show audio feature to drive conversions
        summary: (book.summary || '').substring(0, 3000) + '...', // Truncate summary (null-safe)
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
          alternateVersionId,
          alternateSlug,
          message: 'Login to access full content'
        },
      });
    }

    // CRITICAL: Track book access for freemium limit enforcement.
    // Use upsert with composite key to avoid unique-constraint crashes when a user
    // re-reads a book in a new month (findFirst + create pattern would fail because
    // the date-filtered findFirst returns null for old records, then create violates @@unique([userId, bookId])).
    await prisma.readingProgress.upsert({
      where: {
        userId_bookId: { userId, bookId: book.id },
      },
      update: {}, // record already exists — don't overwrite reading progress
      create: {
        userId,
        bookId: book.id,
        progress: 0,
        currentChapter: 0,
        timeSpent: 0,
        isCompleted: 0,
      },
    });

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
          alternateVersionId,
          alternateSlug,
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
        alternateVersionId,
        alternateSlug,
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
    const { q, page = 1, limit = 20, language = 'en' } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const searchTerm = String(q).toLowerCase();

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          language: language as string,
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
          language: language as string,
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
