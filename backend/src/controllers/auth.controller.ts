import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { EmailService } from '../services/email.service';


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

    // Send welcome email (don't wait for it, don't block registration)
    EmailService.sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName
    }).catch(err => logger.error('Failed to send welcome email:', err));

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

// Forgot Password - Send reset email
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If that email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: resetTokenExpiry
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'https://book-digest.com'}/reset-password?token=${resetToken}`;
    
    EmailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetUrl
    }).catch((err: any) => logger.error('Failed to send password reset email:', err));

    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      status: 'success',
      message: 'If that email exists, a reset link has been sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset Password - Verify token and update password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required', 400);
    }

    // Hash the token from URL
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: {
          gt: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    logger.info(`Password reset successful for: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};
