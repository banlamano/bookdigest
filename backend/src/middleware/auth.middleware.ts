import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verify user still exists and check subscription status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true,
        subscriptionType: true,
        subscriptionEnd: true
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // Auto-expire subscription if end date has passed
    if (user.subscriptionType !== 'FREE' && user.subscriptionEnd) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEnd);
      
      if (endDate < now) {
        // Subscription expired - revert to FREE
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionType: 'FREE',
            subscriptionId: null,
            subscriptionEnd: null
          }
        });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { subscriptionType: true, subscriptionEnd: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if subscription is active
    const isPremium = user.subscriptionType !== 'FREE' && 
                     user.subscriptionEnd && 
                     new Date(user.subscriptionEnd) > new Date();

    if (!isPremium) {
      throw new AppError('Premium subscription required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
