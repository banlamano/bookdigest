import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  return jwt.sign(
    { userId, email, role },
    secret,
    { expiresIn: '7d' } as SignOptions
  );
};

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionType: true,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      status: 'success',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify subscription status and auto-expire if needed
    let currentSubscriptionType = user.subscriptionType;
    let currentSubscriptionEnd = user.subscriptionEnd;
    
    if (user.subscriptionType !== 'FREE' && user.subscriptionEnd) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEnd);
      
      if (endDate < now) {
        // Subscription expired - update to FREE
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionType: 'FREE',
            subscriptionId: null,
            subscriptionEnd: null
          }
        });
        
        currentSubscriptionType = 'FREE';
        currentSubscriptionEnd = null;
        
        logger.info(`Subscription expired for user: ${email}, reverted to FREE`);
      }
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    logger.info(`User logged in: ${email}`);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionType: currentSubscriptionType,
          subscriptionEnd: currentSubscriptionEnd,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        subscriptionType: true,
        subscriptionEnd: true,
        subscriptionId: true,
        booksRead: true,
        totalReadingTime: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check and update expired subscription
    let updatedUser = user;
    if (user.subscriptionType !== 'FREE' && user.subscriptionEnd) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEnd);
      
      if (endDate < now) {
        // Subscription expired - update to FREE
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionType: 'FREE',
            subscriptionId: null,
            subscriptionEnd: null
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            subscriptionType: true,
            subscriptionEnd: true,
            subscriptionId: true,
            booksRead: true,
            totalReadingTime: true,
            currentStreak: true,
            longestStreak: true,
            createdAt: true,
          }
        });
        
        logger.info(`Subscription expired for user: ${user.email}, reverted to FREE`);
      }
    }

    res.json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { firstName, lastName, avatar },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
