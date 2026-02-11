import { Router } from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Webhook raw body parsing is handled at app level in server.ts (must run before express.json)
router.post('/webhook', handleWebhook);

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/subscription-status', authenticate, getSubscriptionStatus);
router.post('/cancel-subscription', authenticate, cancelSubscription);

export default router;
