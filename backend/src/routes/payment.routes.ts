import { Router } from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Webhook needs raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/subscription-status', authenticate, getSubscriptionStatus);
router.post('/cancel-subscription', authenticate, cancelSubscription);

export default router;
