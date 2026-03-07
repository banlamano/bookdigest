import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AISummaryService, SummaryLanguage } from '../services/ai-summary.service';

const router = Router();
const prisma = new PrismaClient();
const aiService = new AISummaryService();

function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET;
  
  if (token !== adminSecret) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
}

router.post('/regenerate-german', authenticate, async (req, res) => {
  try {
    const { bookIds, force } = req.body;
    const language: SummaryLanguage = 'de';
    
    let books;
    if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
      books = await prisma.book.findMany({
        where: { id: { in: bookIds } }
      });
    } else {
      books = await prisma.book.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    }

    const results = {
      total: books.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const book of books) {
      try {
        console.log(`\n📚 Generating German summary for: ${book.title}`);
        
        const bookData = {
          title: book.title,
          author: book.author,
          description: book.description || undefined,
          pageCount: book.pageCount || undefined,
        };

        const summary = await aiService.generateEnhancedSummary(bookData, language);
        
        await prisma.book.update({
          where: { id: book.id },
          data: {
            summary: summary.bigIdea,
            keyInsights: summary.keyInsights,
            chapters: summary.chapterSummaries,
            quotes: summary.memorableQuotes,
            actionItems: summary.actionPlan,
          }
        });

        results.success++;
        console.log(`✅ German summary generated for: ${book.title}`);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${book.title}: ${error.message}`);
        console.error(`❌ Failed: ${book.title}`, error.message);
      }
    }

    res.json({
      success: true,
      message: `German regeneration complete: ${results.success}/${results.total} books`,
      results
    });
  } catch (error: any) {
    console.error('German regeneration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
