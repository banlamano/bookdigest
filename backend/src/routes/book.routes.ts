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

// Premium content routes
router.get('/:id/audio', authenticate, checkSubscription, (req, res) => {
  res.json({ message: 'Audio streaming endpoint' });
});

export default router;
