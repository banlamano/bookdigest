import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from '../services/ai-summary-openai.service';

const router = Router();
const prisma = new PrismaClient();

// Admin endpoint to regenerate summaries
router.post('/regenerate-summaries', async (req, res) => {
  const { batchSize = 10, force = false, limit, offset = 0 } = req.body;
  
  try {
    console.log(`Starting summary regeneration... (offset: ${offset}, limit: ${limit || 'all'})`);
    
    const books = await prisma.book.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        tags: true,
        publishedYear: true,
        description: true
      }
    });

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize);
      
      for (const book of batch) {
        try {
          // Skip if already has good content
          if (!force && book.summary && book.summary.length > 500) {
            continue;
          }

          processed++;
          console.log(`Processing: ${book.title}`);

          const categories = book.tags ? book.tags.split(',').map(t => t.trim()) : undefined;
          const enhanced = await aiSummaryService.generateEnhancedSummary({
            title: book.title,
            author: book.author,
            description: book.description || undefined,
            categories: categories,
            publishedDate: book.publishedYear ? `${book.publishedYear}-01-01` : undefined
          });

          await prisma.book.update({
            where: { id: book.id },
            data: {
              summary: `${enhanced.bigIdea}\n\n${enhanced.whyItMatters}`,
              keyInsights: JSON.stringify(enhanced.keyInsights.map(insight => ({
                title: insight.title,
                description: `${insight.explanation} ${insight.example}`
              }))),
              chapters: JSON.stringify(enhanced.chapterSummaries.map(ch => ({
                number: ch.chapter,
                title: ch.title,
                summary: ch.summary
              }))),
              quotes: JSON.stringify(enhanced.memorableQuotes.map(q => q.quote)),
              actionItems: JSON.stringify(enhanced.actionPlan.map(a => a.action))
            }
          });

          success++;
          console.log(`✅ Success: ${book.title}`);

        } catch (error) {
          failed++;
          console.error(`❌ Failed: ${book.title}`, error);
        }
      }

      // Delay between batches
      if (i + batchSize < books.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    res.json({
      status: 'success',
      message: 'Summary regeneration completed',
      stats: {
        total: books.length,
        processed,
        success,
        failed
      }
    });

  } catch (error) {
    console.error('Regeneration error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
