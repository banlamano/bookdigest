import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';


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
        // `id` breaks ties: many books share a rating, and without a unique
        // tiebreaker Postgres may order them differently per query, so with
        // skip/take the same book can appear on two pages while another is
        // never returned at all — leaving those books unreachable by crawlers.
        orderBy: [{ rating: 'desc' }, { id: 'asc' }],
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
