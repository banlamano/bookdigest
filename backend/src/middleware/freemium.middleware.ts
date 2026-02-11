import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './error.middleware';

const prisma = new PrismaClient();

const FREE_TIER_LIMIT = 3; // 3 books per month for free users

export const checkFreemiumLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If user is not authenticated, skip this check (handled elsewhere)
    if (!req.user) {
      return next();
    }

    const userId = req.user.userId;

    // Get user's subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, subscriptionEnd: true },
    });

    if (!user) {
      return next();
    }

    // If user has premium subscription, allow access
    const isPremiumUser = user.subscriptionType !== 'FREE';
    
    if (isPremiumUser) {
      // If no expiration date, allow unlimited access
      if (!user.subscriptionEnd) {
        return next();
      }
      
      // If expiration date is set, check if active
      const subscriptionActive = new Date(user.subscriptionEnd) > new Date();
      if (subscriptionActive) {
        return next();
      }
    }

    // For free users, check monthly limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const booksReadThisMonth = await prisma.readingProgress.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    if (booksReadThisMonth >= FREE_TIER_LIMIT) {
      throw new AppError(
        `Free tier limit reached. You've read ${booksReadThisMonth} books this month. Upgrade to Premium for unlimited access.`,
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Helper to get remaining free books for the month
export const getFreemiumStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionType: true, subscriptionEnd: true },
  });

  if (!user) {
    return { limit: 0, used: 0, remaining: 0, isPremium: false };
  }

  // Check if subscription is truly active
  const isPremiumUser = user.subscriptionType !== 'FREE';
  
  // If user is premium type, check expiration (if set)
  if (isPremiumUser) {
    // If no expiration date set, treat as unlimited (lifetime premium)
    if (!user.subscriptionEnd) {
      return { limit: -1, used: 0, remaining: -1, isPremium: true };
    }
    
    // If expiration date is set, check if still active
    const subscriptionActive = new Date(user.subscriptionEnd) > new Date();
    
    if (subscriptionActive) {
      return { limit: -1, used: 0, remaining: -1, isPremium: true };
    }
    
    // Subscription expired - revert to free
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: 'FREE',
        subscriptionId: null,
        subscriptionEnd: null
      }
    });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const booksReadThisMonth = await prisma.readingProgress.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return {
    limit: FREE_TIER_LIMIT,
    used: booksReadThisMonth,
    remaining: Math.max(0, FREE_TIER_LIMIT - booksReadThisMonth),
    isPremium: false,
  };
};
