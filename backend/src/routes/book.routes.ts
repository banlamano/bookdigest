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

const router = Router();

// Public routes
router.get('/', getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.get('/:id/reviews', getBookReviews);

// Protected routes
router.post('/:id/favorite', authenticate, toggleFavorite);
router.get('/favorites/me', authenticate, getUserFavorites);
router.post('/:id/progress', authenticate, updateProgress);
router.get('/:id/progress', authenticate, getBookProgress);
router.post('/:id/reviews', authenticate, addReview);

// Admin routes (update book cover)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { coverImage } = req.body;

    if (!coverImage) {
      return res.status(400).json({ success: false, message: 'Cover image URL required' });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: { coverImage },
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Book cover updated successfully',
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
