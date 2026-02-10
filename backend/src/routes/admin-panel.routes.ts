import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check admin access - supports both admin key and JWT
const checkAdminAccess = async (req: any, res: any, next: any) => {
  try {
    // Option 1: Check for admin key in headers (simple auth)
    const adminKey = req.headers['x-admin-key'];
    
    if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
      return next();
    }
    
    // Option 2: Check for JWT token with admin role (integrated auth)
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as any;
        
        // Verify user exists and has admin role
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        
        if (user && user.role === 'ADMIN') {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        // JWT verification failed, continue to return 401 below
      }
    }
    
    // No valid authentication found
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Admin access required'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Admin access required'
    });
  }
};

// Dashboard stats
router.get('/dashboard/stats', checkAdminAccess, async (req, res) => {
  try {
    const [totalBooks, totalUsers, premiumBooks, freeBooks] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.book.count({ where: { isPremium: 1 } }),
      prisma.book.count({ where: { isPremium: 0 } })
    ]);

    // Get category counts
    const categoryStats = await prisma.book.groupBy({
      by: ['categoryId'],
      _count: {
        _all: true
      }
    });

    // Get category names
    const categoriesWithNames = await Promise.all(
      categoryStats.map(async (stat) => {
        const category = await prisma.category.findUnique({
          where: { id: stat.categoryId },
          select: { name: true }
        });
        return {
          category: category?.name || 'Unknown',
          _count: stat._count._all
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        premiumBooks,
        freeBooks,
        categories: categoriesWithNames
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all books with pagination and search
router.get('/books', checkAdminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const isPremium = req.query.isPremium as string;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true' ? 1 : 0;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          category: {
            select: {
              name: true
            }
          },
          coverImage: true,
          isPremium: true,
          createdAt: true,
          summary: true
        }
      }),
      prisma.book.count({ where })
    ]);

    // Transform books to flatten category
    const transformedBooks = books.map(book => ({
      ...book,
      category: book.category?.name || 'Unknown',
      isPremium: book.isPremium === 1
    }));

    res.json({
      success: true,
      data: {
        books: transformedBooks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single book details
router.get('/books/:id', checkAdminAccess, async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({ success: true, data: book });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update book
router.put('/books/:id', checkAdminAccess, async (req, res) => {
  try {
    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete book
router.delete('/books/:id', checkAdminAccess, async (req, res) => {
  try {
    await prisma.book.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create book
router.post('/books', checkAdminAccess, async (req, res) => {
  try {
    const book = await prisma.book.create({
      data: req.body
    });

    res.json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk operations
router.post('/books/bulk/delete', checkAdminAccess, async (req, res) => {
  try {
    const { bookIds } = req.body;
    
    await prisma.book.deleteMany({
      where: { id: { in: bookIds } }
    });

    res.json({
      success: true,
      message: `Deleted ${bookIds.length} books`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/books/bulk/update', checkAdminAccess, async (req, res) => {
  try {
    const { bookIds, updates } = req.body;
    
    await prisma.book.updateMany({
      where: { id: { in: bookIds } },
      data: updates
    });

    res.json({
      success: true,
      message: `Updated ${bookIds.length} books`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users with pagination and filters
router.get('/users', checkAdminAccess, async (req: any, res: any) => {
  try {
    const { page = '1', limit = '20', search, role, subscriptionType } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Subscription filter
    if (subscriptionType) {
      where.subscriptionType = subscriptionType;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          subscriptionType: true,
          subscriptionEnd: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user role
router.put('/users/:userId/role', checkAdminAccess, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    logger.info(`User role updated: ${userId} -> ${role}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:userId', checkAdminAccess, async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId }
    });

    logger.info(`User deleted: ${userId}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Analytics endpoint
router.get('/analytics', checkAdminAccess, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days: 7, 30, 90
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User metrics
    const totalUsers = await prisma.user.count();
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    
    // Active users - users with any reading progress
    const usersWithProgress = await prisma.readingProgress.groupBy({
      by: ['userId'],
      where: {
        updatedAt: {
          gte: startDate
        }
      }
    });
    const activeUsers = usersWithProgress.length;
    
    const previousPeriodUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: startDate
        }
      }
    });

    // Subscription metrics
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionType'],
      _count: true
    });

    const freeUsers = subscriptionStats.find(s => s.subscriptionType === 'FREE')?._count || 0;
    const premiumMonthly = subscriptionStats.find(s => s.subscriptionType === 'PREMIUM_MONTHLY')?._count || 0;
    const premiumYearly = subscriptionStats.find(s => s.subscriptionType === 'PREMIUM_YEARLY')?._count || 0;
    const premiumUsers = premiumMonthly + premiumYearly;

    // Calculate MRR (Monthly Recurring Revenue)
    const monthlyPrice = 9.99;
    const yearlyMonthlyEquivalent = 79.99 / 12;
    const mrr = (premiumMonthly * monthlyPrice) + (premiumYearly * yearlyMonthlyEquivalent);

    // Conversion rate
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    // Engagement metrics - Most popular books
    let popularBooksWithDetails = [];
    let totalBookViews = 0;
    
    try {
      const popularBooks = await prisma.readingProgress.groupBy({
        by: ['bookId'],
        _count: true,
        orderBy: {
          _count: {
            bookId: 'desc'
          }
        },
        take: 10
      });

      if (popularBooks.length > 0) {
        // Get book details
        const bookIds = popularBooks.map(b => b.bookId);
        const books = await prisma.book.findMany({
          where: {
            id: {
              in: bookIds
            }
          },
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            category: {
              select: {
                name: true
              }
            }
          }
        });

        popularBooksWithDetails = popularBooks.map(pb => {
          const book = books.find(b => b.id === pb.bookId);
          return {
            bookId: pb.bookId,
            views: pb._count,
            title: book?.title || 'Unknown',
            author: book?.author || 'Unknown',
            coverImage: book?.coverImage,
            category: book?.category?.name || 'Uncategorized'
          };
        });
        
        totalBookViews = popularBooks.reduce((sum, b) => sum + b._count, 0);
      }
    } catch (error) {
      logger.error('Error fetching popular books:', error);
      // Continue with empty array
    }

    // User growth over time (simplified for SQLite/PostgreSQL compatibility)
    const allUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const userGrowthMap = new Map<string, number>();
    allUsers.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
    });

    const userGrowthData = Array.from(userGrowthMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate growth percentage
    const userGrowthPercentage = previousPeriodUsers > 0 
      ? ((newUsers / previousPeriodUsers) * 100).toFixed(1)
      : '100';

    res.json({
      success: true,
      data: {
        period: days,
        userMetrics: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          growth: `${userGrowthPercentage}%`,
          growthData: userGrowthData
        },
        subscriptionMetrics: {
          free: freeUsers,
          premiumMonthly,
          premiumYearly,
          totalPremium: premiumUsers,
          conversionRate: conversionRate.toFixed(2) + '%',
          mrr: mrr.toFixed(2)
        },
        engagementMetrics: {
          popularBooks: popularBooksWithDetails,
          totalBookViews: popularBooks.reduce((sum, b) => sum + b._count, 0)
        }
      }
    });

  } catch (error: any) {
    logger.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
});

export default router;
