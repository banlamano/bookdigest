import { Router } from 'express';
import { getUserStats, getReadingHistory } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, getUserStats);
router.get('/history', authenticate, getReadingHistory);

export default router;
