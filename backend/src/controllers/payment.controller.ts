import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});


// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planType } = req.body; // 'monthly', 'yearly', or 'team'
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, freeTrialUsed: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine price ID based on plan type
    let priceId: string;
    let subscriptionType: string;
    let mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';
    const trialEligible = user.freeTrialUsed === 0;

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
        subscriptionType = 'PREMIUM_TEAM';
        // Team plan is a recurring subscription — leave mode='subscription'
        break;
      case 'lifetime':
        priceId = process.env.STRIPE_PRICE_LIFETIME!;
        subscriptionType = 'LIFETIME';
        mode = 'payment'; // One time payment
        break;
      default:
        throw new AppError('Invalid plan type', 400);
    }

    // Build session params; add 7-day trial for first-time subscribers
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      allow_promotion_codes: true,
      metadata: { userId, subscriptionType, hadTrial: trialEligible && mode === 'subscription' ? '1' : '0' },
    };
    if (mode === 'subscription' && trialEligible) {
      sessionParams.subscription_data = { trial_period_days: 7 };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
        await handlePaymentFailed(invoice);
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
  const subscriptionId = session.subscription as string | undefined;

  // Get subscription details
  let endDate: Date | null = null;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    endDate = new Date(subscription.current_period_end * 1000);
  } else if (subscriptionType === 'LIFETIME') {
    // 100 years from now
    endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true }
  });

  // Update user subscription (idempotent). Bump freeTrialUsed if this
  // checkout actually used a trial — prevents repeat trial abuse.
  const hadTrial = session.metadata?.hadTrial === '1';
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionType: subscriptionType as any,
      subscriptionId,
      subscriptionEnd: endDate,
      ...(hadTrial ? { freeTrialUsed: 1 } : {}),
    },
  });

  // Create transaction record (idempotent: Stripe may retry webhooks)
  // In subscription mode, session.payment_intent can be null.
  if (session.id) {
    await prisma.transaction.upsert({
      where: { stripeSessionId: session.id },
      update: {
        stripePaymentId: (session.payment_intent as string) || null,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'EUR',
        status: 'COMPLETED',
        subscriptionType: subscriptionType as any,
      },
      create: {
        userId,
        stripeSessionId: session.id,
        stripePaymentId: (session.payment_intent as string) || null,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'EUR',
        status: 'COMPLETED',
        subscriptionType: subscriptionType as any,
      },
    });
  }

  // Send payment confirmation email
  if (user) {
    const planName = subscriptionType === 'PREMIUM_MONTHLY' ? 'Premium Monthly' :
                     subscriptionType === 'PREMIUM_YEARLY' ? 'Premium Yearly' :
                     'Lifetime Plan';

    // Map Stripe 3-letter code to display symbol
    const currencySymbolMap: Record<string, string> = {
      eur: '€', usd: '$', gbp: '£', chf: 'CHF ', cad: 'CA$', aud: 'A$',
    };
    const rawCurrency = (session.currency || 'eur').toLowerCase();
    const currencySymbol = currencySymbolMap[rawCurrency] ?? rawCurrency.toUpperCase() + ' ';

    EmailService.sendPaymentConfirmation(
      { email: user.email, firstName: user.firstName },
      {
        amount: (session.amount_total || 0) / 100,
        plan: planName,
        currency: currencySymbol,
      }
    ).catch(err => logger.error('Failed to send payment confirmation email:', err));
  }

  logger.info(`Subscription activated for user ${userId}: ${subscriptionType}`);
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  // Some Stripe payloads may omit current_period_end in edge cases; guard it.
  const periodEnd = (subscription as any).current_period_end;
  const endDate = periodEnd ? new Date(periodEnd * 1000) : null;

  try {
    const result = await prisma.user.updateMany({
      where: { subscriptionId },
      data: endDate ? { subscriptionEnd: endDate } : {},
    });

    logger.info(`Subscription updated: ${subscriptionId} (matched users: ${result.count})`);
  } catch (error) {
    // Do not fail webhook delivery. checkout.session.completed already sets subscriptionEnd.
    logger.error(`Failed to process customer.subscription.updated for ${subscriptionId}:`, error);
  }
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

// Handle payment failed
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string | undefined;

  if (!subscriptionId) {
    logger.warn(`Payment failed invoice ${invoice.id} has no associated subscription — skipping user lookup`);
    return;
  }

  // Find the user who owns this subscription
  const user = await prisma.user.findFirst({
    where: { subscriptionId },
    select: { id: true, email: true, firstName: true },
  });

  if (user) {
    EmailService.sendPaymentFailed({
      email: user.email,
      firstName: user.firstName,
    }).catch(err => logger.error('Failed to send payment failed email:', err));
  } else {
    logger.warn(`Payment failed for subscription ${subscriptionId} but no matching user found`);
  }

  logger.error(`Payment failed for subscription ${subscriptionId}`);
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
        freeTrialUsed: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let subscriptionDetails: any = null;
    if (user.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
        expand: ['default_payment_method'],
      });

      let paymentMethod: any = null;
      const dpm: any = (subscription as any).default_payment_method;
      if (dpm?.card?.last4) {
        paymentMethod = {
          brand: dpm.card.brand,
          last4: dpm.card.last4,
        };
      }

      subscriptionDetails = {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethod,
      };
    }

    res.json({
      status: 'success',
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionEnd: user.subscriptionEnd,
        details: subscriptionDetails,
        trialEligible: user.freeTrialUsed === 0 && user.subscriptionType === 'FREE',
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
