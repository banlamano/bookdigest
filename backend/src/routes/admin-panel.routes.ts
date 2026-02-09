import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// Get all users
router.get('/users', checkAdminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionType: true,
          createdAt: true
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: {
        users,
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

export default router;
