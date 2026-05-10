import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import Stripe from 'stripe';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Verify and sync subscription status with Stripe
 * This endpoint helps fix cases where local DB is out of sync with Stripe
 */
export const verifySubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionType: true,
        subscriptionEnd: true,
        subscriptionId: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let updatedUser = user;
    let syncMessage = 'Subscription status is up to date';
    let wasSynced = false;

    // Check if user has a Stripe subscription ID
    if (user.subscriptionId) {
      try {
        // Fetch from Stripe
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        
        const stripeActive = subscription.status === 'active' || subscription.status === 'trialing';
        const stripeEndDate = new Date(subscription.current_period_end * 1000);
        
        // Determine subscription type from Stripe metadata or price
        let subscriptionType = user.subscriptionType;
        if (subscription.metadata?.subscriptionType) {
          subscriptionType = subscription.metadata.subscriptionType;
        }

        // Check if local DB needs update
        const needsUpdate = 
          !stripeActive && user.subscriptionType !== 'FREE' ||
          stripeActive && user.subscriptionType === 'FREE' ||
          user.subscriptionEnd?.getTime() !== stripeEndDate.getTime();

        if (needsUpdate) {
          // Update local DB to match Stripe
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionType: stripeActive ? subscriptionType : 'FREE',
              subscriptionEnd: stripeActive ? stripeEndDate : null,
              subscriptionId: stripeActive ? subscription.id : null,
            },
            select: {
              id: true,
              email: true,
              subscriptionType: true,
              subscriptionEnd: true,
              subscriptionId: true,
            },
          });

          wasSynced = true;
          syncMessage = stripeActive 
            ? 'Subscription reactivated from Stripe' 
            : 'Subscription expired, reverted to FREE';
          
          logger.info(`Subscription synced for user ${user.email}: ${syncMessage}`);
        }
      } catch (stripeError: any) {
        if (stripeError.code === 'resource_missing') {
          // Subscription doesn't exist in Stripe anymore
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionType: 'FREE',
              subscriptionId: null,
              subscriptionEnd: null,
            },
            select: {
              id: true,
              email: true,
              subscriptionType: true,
              subscriptionEnd: true,
              subscriptionId: true,
            },
          });

          wasSynced = true;
          syncMessage = 'Subscription not found in Stripe, reverted to FREE';
          logger.info(`Subscription removed for user ${user.email}: subscription not found in Stripe`);
        } else {
          throw stripeError;
        }
      }
    } else {
      // No Stripe subscription ID - check if subscription should be expired
      if (user.subscriptionType !== 'FREE' && user.subscriptionEnd) {
        const now = new Date();
        if (user.subscriptionEnd < now) {
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionType: 'FREE',
              subscriptionId: null,
              subscriptionEnd: null,
            },
            select: {
              id: true,
              email: true,
              subscriptionType: true,
              subscriptionEnd: true,
              subscriptionId: true,
            },
          });

          wasSynced = true;
          syncMessage = 'Subscription expired, reverted to FREE';
        }
      }
    }

    res.json({
      status: 'success',
      data: {
        user: updatedUser,
        synced: wasSynced,
        message: syncMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};
