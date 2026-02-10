// Simple batch regeneration script - runs locally, no auth needed
import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from './src/services/ai-summary-openai.service';

const prisma = new PrismaClient();

const BATCH_SIZE = 50;
const START_FROM = parseInt(process.argv[2] || '0');

async function regenerateBatch() {
  console.log('\n🚀 BATCH REGENERATION SCRIPT\n');
  console.log('='.repeat(80));
  console.log(`Batch size: ${BATCH_SIZE} books`);
  console.log(`Starting from: Book #${START_FROM}`);
  console.log(`Database: Production PostgreSQL`);
  console.log(`AI Model: OpenAI GPT-4o-mini\n`);

  try {
    // Get books for this batch
    const books = await prisma.book.findMany({
      skip: START_FROM,
      take: BATCH_SIZE,
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        tags: true,
        publishedYear: true
      }
    });

    console.log(`📚 Found ${books.length} books to process\n`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const book of books) {
      try {
        // Skip if already has good content
        if (book.summary && book.summary.length > 800 && !book.summary.includes('transformative guide')) {
          console.log(`⏭️  Skipped: "${book.title}" (already has AI content)`);
          skipped++;
          continue;
        }

        console.log(`🔄 Processing: "${book.title}"...`);

        const categories = book.tags ? book.tags.split(',').map(t => t.trim()) : undefined;
        const enhanced = await aiSummaryService.generateEnhancedSummary({
          title: book.title,
          author: book.author,
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
        console.log(`✅ Success: "${book.title}"\n`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        failed++;
        console.error(`❌ Failed: "${book.title}"`, error instanceof Error ? error.message : error);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 BATCH COMPLETE!\n');
    console.log(`Processed: ${success + failed + skipped} books`);
    console.log(`✅ Successful: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}\n`);

    const nextBatch = START_FROM + BATCH_SIZE;
    const totalBooks = 454;
    const progress = Math.round((nextBatch / totalBooks) * 100);
    
    console.log(`📈 Overall Progress: ${progress}% (${nextBatch}/${totalBooks})\n`);

    if (nextBatch < totalBooks) {
      console.log('⏭️  NEXT STEP:');
      console.log(`Run: npx tsx tmp_rovodev_simple_batch.ts ${nextBatch}\n`);
    } else {
      console.log('🎉 ALL BOOKS PROCESSED!\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateBatch();
