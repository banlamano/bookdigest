import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// List all books with these titles to find their production IDs
router.get('/find-books', async (req, res) => {
  try {
    const titles = [
      'Surge',
      'The Little Book of Hygge',
      'The Artist\'s Journey',
      'How to Win at the Sport of Business',
      'The Aladdin Factor',
      'Clockwork',
      'The Unfair Advantage',
      'Decisive',
      'Crushing It!',
      'Margin of Safety',
      'I Know How She Does It',
      'It Doesn\'t Have to Be Crazy at Work',
      'Purple Cow',
      'The Second Machine Age',
      'The Compound Effect',
      'The Telomere Effect',
      'The Snowball',
      'The Sales Acceleration Formula',
    ];

    const results = [];

    for (const title of titles) {
      const books = await prisma.book.findMany({
        where: {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true
        }
      });

      if (books.length > 0) {
        results.push(...books);
      } else {
        results.push({ title, status: 'NOT_FOUND' });
      }
    }

    res.json({
      success: true,
      message: `Found books in production database`,
      data: {
        total: results.length,
        books: results
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
