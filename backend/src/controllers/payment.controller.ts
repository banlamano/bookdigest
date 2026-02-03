import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planType } = req.body; // 'monthly', 'yearly', or 'team'
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine price ID based on plan type
    let priceId: string;
    let subscriptionType: string;

    switch (planType) {
      case 'monthly':
        priceId = process.env.STRIPE_PRICE_MONTHLY!;
        subscriptionType = 'PREMIUM_MONTHLY';
        break;
      case 'yearly':
        priceId = process.env.STRIPE_PRICE_YEARLY!;
        subscriptionType = 'PREMIUM_YEARLY';
        break;
      case 'team':
        priceId = process.env.STRIPE_PRICE_TEAM!;
        subscriptionType = 'TEAM';
        break;
      default:
        throw new AppError('Invalid plan type', 400);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        userId,
        subscriptionType,
      },
    });

    res.json({
      status: 'success',
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info(`Payment succeeded for invoice: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.error(`Payment failed for invoice: ${invoice.id}`);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle checkout completion
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, subscriptionType } = session.metadata!;
  const subscriptionId = session.subscription as string;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const endDate = new Date(subscription.current_period_end * 1000);

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionType: subscriptionType as any,
      subscriptionId,
      subscriptionEnd: endDate,
    },
  });

  // Create transaction record
  await prisma.transaction.create({
    data: {
      userId,
      stripeSessionId: session.id,
      stripePaymentId: session.payment_intent as string,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'EUR',
      status: 'COMPLETED',
      subscriptionType: subscriptionType as any,
    },
  });

  logger.info(`Subscription activated for user ${userId}: ${subscriptionType}`);
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const endDate = new Date(subscription.current_period_end * 1000);

  await prisma.user.updateMany({
    where: { subscriptionId },
    data: { subscriptionEnd: endDate },
  });

  logger.info(`Subscription updated: ${subscriptionId}`);
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  await prisma.user.updateMany({
    where: { subscriptionId },
    data: {
      subscriptionType: 'FREE',
      subscriptionId: null,
      subscriptionEnd: null,
    },
  });

  logger.info(`Subscription canceled: ${subscriptionId}`);
}

// Get subscription status
export const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        subscriptionEnd: true,
        subscriptionId: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let subscriptionDetails = null;
    if (user.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      subscriptionDetails = {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    res.json({
      status: 'success',
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionEnd: user.subscriptionEnd,
        details: subscriptionDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionId: true },
    });

    if (!user?.subscriptionId) {
      throw new AppError('No active subscription found', 404);
    }

    // Cancel at period end (don't cancel immediately)
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info(`Subscription cancellation scheduled for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Subscription will be canceled at the end of the billing period',
    });
  } catch (error) {
    next(error);
  }
};
