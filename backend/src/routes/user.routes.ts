import { Router } from 'express';
import { getUserStats, getReadingHistory, getAchievements } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { getFreemiumStatusController } from '../controllers/freemium.controller';
import { verifySubscriptionStatus } from '../controllers/subscription.controller';

const router = Router();

router.get('/stats', authenticate, getUserStats);
router.get('/history', authenticate, getReadingHistory);
router.get('/achievements', authenticate, getAchievements);
router.get('/freemium-status', authenticate, getFreemiumStatusController);
router.post('/verify-subscription', authenticate, verifySubscriptionStatus);

export default router;
