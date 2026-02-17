import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from '../services/ai-summary-openai.service';

const router = Router();
const prisma = new PrismaClient();

// Admin endpoint to regenerate summaries
router.post('/regenerate-summaries', async (req, res) => {
  const { batchSize = 10, force = false, limit, offset = 0, useGPT4 = false } = req.body;
  
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
        keyInsights: true,
        chapters: true,
        quotes: true,
        actionItems: true,
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
          // Skip if already has good content (2000+ total words AND substantial chapters)
          if (!force) {
            const summaryWords = book.summary ? book.summary.split(/\s+/).length : 0;
            const insightsWords = book.keyInsights ? book.keyInsights.split(/\s+/).length : 0;
            const chaptersWords = book.chapters ? book.chapters.split(/\s+/).length : 0;
            const quotesWords = book.quotes ? book.quotes.split(/\s+/).length : 0;
            const actionItemsWords = book.actionItems ? book.actionItems.split(/\s+/).length : 0;
            
            const totalWords = summaryWords + insightsWords + chaptersWords + quotesWords + actionItemsWords;
            
            // Parse chapters to compute average chapter length
            let avgChapterWords = 0;
            try {
              const parsedChapters = JSON.parse(book.chapters || '[]');
              if (Array.isArray(parsedChapters) && parsedChapters.length > 0) {
                const chapterWordsSum = parsedChapters.reduce((sum: number, ch: any) => {
                  const chSummary = ch.summary || '';
                  return sum + chSummary.split(/\s+/).length;
                }, 0);
                avgChapterWords = chapterWordsSum / parsedChapters.length;
              }
            } catch (e) {
              // If parsing fails, assume chapters are weak
            }
            
            // Skip only if total content >= 2000 words AND average chapter >= 200 words
            if (totalWords >= 2000 && avgChapterWords >= 200) {
              console.log(`⏭️  Skipping "${book.title}" (already good: ${totalWords} total words, ${Math.round(avgChapterWords)} avg chapter words)`);
              continue;
            }
          }

          processed++;
          console.log(`Processing: ${book.title}`);

          const categories = book.tags ? book.tags.split(',').map(t => t.trim()) : undefined;
          const enhanced = await aiSummaryService.generateEnhancedSummary(
            {
              title: book.title,
              author: book.author,
              description: book.description || undefined,
              categories: categories,
              publishedDate: book.publishedYear ? `${book.publishedYear}-01-01` : undefined
            },
            { useGPT4 } // Pass GPT-4 flag from request body
          );

          const newSummary = `${enhanced.bigIdea}\n\n${enhanced.whyItMatters}`;
          const newKeyInsights = JSON.stringify(enhanced.keyInsights.map(insight => ({
            title: insight.title,
            description: `${insight.explanation} ${insight.example}`
          })));
          const newChapters = JSON.stringify(enhanced.chapterSummaries.map(ch => ({
            number: ch.chapter,
            title: ch.title,
            summary: ch.summary
          })));

          console.log(`   📊 Generated: ${newSummary.split(/\s+/).length} summary words, ${enhanced.chapterSummaries.length} chapters, ${enhanced.keyInsights.length} insights`);

          const updated = await prisma.book.update({
            where: { id: book.id },
            data: {
              summary: newSummary,
              keyInsights: newKeyInsights,
              chapters: newChapters,
              quotes: JSON.stringify(enhanced.memorableQuotes.map(q => q.quote)),
              actionItems: JSON.stringify(enhanced.actionPlan.map(a => a.action))
            }
          });

          // Verify the update actually saved
          console.log(`   💾 Saved to DB: summary=${updated.summary.split(/\s+/).length} words, chapters=${updated.chapters.length} chars`);

          success++;
          console.log(`✅ Success: ${book.title}`);

        } catch (error) {
          failed++;
          console.error(`❌ Failed: ${book.title}`, error);
        }
      }

      // Force disconnect/reconnect to ensure data is flushed to DB
      await prisma.$disconnect();
      
      // Delay between batches
      if (i + batchSize < books.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await prisma.$connect(); // Reconnect for next batch
      }
    }
    
    // Final disconnect
    await prisma.$disconnect();

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
