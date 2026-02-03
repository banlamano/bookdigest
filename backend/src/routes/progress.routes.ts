import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  updateProgress,
  getProgress,
  getUserProgress,
  addFavorite,
  removeFavorite,
  getFavorites,
  getReadingHistory,
} from '../controllers/progress.controller';

const router = Router();

// Progress routes
router.post('/books/:bookId/progress', authenticate, updateProgress);
router.get('/books/:bookId/progress', authenticate, getProgress);
router.get('/progress', authenticate, getUserProgress);

// Favorites routes
router.post('/books/:bookId/favorite', authenticate, addFavorite);
router.delete('/books/:bookId/favorite', authenticate, removeFavorite);
router.get('/favorites', authenticate, getFavorites);

// Reading history
router.get('/history', authenticate, getReadingHistory);

export default router;
