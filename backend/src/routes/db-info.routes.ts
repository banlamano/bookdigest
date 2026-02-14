import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Debug endpoint to show database connection info
router.get('/db-info', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    // Hide password
    const safeUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
    
    // Count books to verify connection
    const bookCount = await prisma.book.count();
    
    // Get one book to verify data
    const sampleBook = await prisma.book.findFirst({
      where: { id: '006d6f26-2829-4f8c-aaa0-e66ad69de651' }, // The Snowball
      select: {
        id: true,
        title: true,
        summary: true,
        chapters: true,
        keyInsights: true
      }
    });

    res.json({
      databaseUrl: safeUrl,
      totalBooks: bookCount,
      sampleBook: {
        id: sampleBook?.id,
        title: sampleBook?.title,
        summaryWords: sampleBook?.summary?.split(/\s+/).length || 0,
        chaptersLength: sampleBook?.chapters?.length || 0,
        insightsLength: sampleBook?.keyInsights?.length || 0,
        summaryPreview: sampleBook?.summary?.substring(0, 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
