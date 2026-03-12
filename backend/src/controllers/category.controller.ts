import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { language = 'en' } = req.query;
    
    // We fetch all categories, but in the future we could filter by language if needed
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { 
            books: {
              where: { language: language as string }
            } 
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, language = 'en' } = req.query;

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { 
          categoryId: category.id,
          language: language as string
        },
        skip,
        take: Number(limit),
        include: {
          category: true,
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.book.count({ 
        where: { 
          categoryId: category.id,
          language: language as string
        } 
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        category,
        books,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
