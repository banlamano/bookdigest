import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  searchBooks,
  toggleFavorite,
  getUserFavorites,
  updateProgress,
  getBookProgress,
  addReview,
  getBookReviews,
} from '../controllers/book.controller';
import { authenticate, checkSubscription } from '../middleware/auth.middleware';
import { optionalAuthenticate } from '../middleware/optionalAuth.middleware';
import { checkFreemiumLimit } from '../middleware/freemium.middleware';

const router = Router();

// Public routes (browse only)
router.get('/', getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/search', searchBooks);

// Book detail - Public for metadata, but content restricted by authentication
router.get('/:id', optionalAuthenticate, getBookById);
router.get('/:id/reviews', getBookReviews);

// Protected routes
router.post('/:id/favorite', authenticate, toggleFavorite);
router.get('/favorites/me', authenticate, getUserFavorites);
router.post('/:id/progress', authenticate, updateProgress);
router.get('/:id/progress', authenticate, getBookProgress);
router.post('/:id/reviews', authenticate, addReview);

// Admin routes (update book - cover and/or amazon link)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { coverImage, amazonLink } = req.body;

    if (!coverImage && !amazonLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either coverImage or amazonLink is required' 
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Build update data object
    const updateData: any = {};
    if (coverImage) updateData.coverImage = coverImage;
    if (amazonLink) updateData.amazonLink = amazonLink;

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book },
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, message: 'Failed to update book' });
  }
});

// Premium content routes
router.get('/:id/audio', authenticate, checkSubscription, (req, res) => {
  res.json({ message: 'Audio streaming endpoint' });
});

export default router;
