import { Router } from 'express';
import { getUserStats, getReadingHistory } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { getFreemiumStatusController } from '../controllers/freemium.controller';

const router = Router();

router.get('/stats', authenticate, getUserStats);
router.get('/history', authenticate, getReadingHistory);
router.get('/freemium-status', authenticate, getFreemiumStatusController);

export default router;
