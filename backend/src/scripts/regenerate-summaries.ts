import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing service
// Try multiple env files
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config(); // Default .env

import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from '../services/ai-summary-openai.service';

const prisma = new PrismaClient();

interface RegenerationStats {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
}

async function regenerateAllSummaries(options: {
  batchSize?: number;
  delayMs?: number;
  forceRegenerate?: boolean;
  dryRun?: boolean;
} = {}) {
  const {
    batchSize = 5, // Reduced to 5 to stay under 15 RPM limit
    delayMs = 5000, // 5 seconds between batches to respect Gemini free tier (15 RPM)
    forceRegenerate = false,
    dryRun = false
  } = options;

  const stats: RegenerationStats = {
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0
  };

  console.log('\n🚀 Starting Summary Regeneration Process...\n');
  console.log('Configuration:');
  console.log(`- Batch size: ${batchSize}`);
  console.log(`- Delay between batches: ${delayMs}ms`);
  console.log(`- Force regenerate: ${forceRegenerate}`);
  console.log(`- Dry run: ${dryRun}`);
  console.log(`- AI Service available: ${aiSummaryService.isAvailable() ? '✅ YES' : '❌ NO (will use fallback)'}\n`);
  console.log(`- OPENAI_API_KEY found: ${process.env.OPENAI_API_KEY ? '✅ YES' : '❌ NO'}\n`);

  if (!aiSummaryService.isAvailable()) {
    console.error('⚠️  ERROR: OPENAI_API_KEY not found in environment variables!');
    console.error('Please add OPENAI_API_KEY to your Render environment variables.');
    throw new Error('OPENAI_API_KEY is required');
  }

  try {
    // Get all books
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        keyInsights: true,
        publishedYear: true,
        tags: true
      }
    });

    stats.total = books.length;
    console.log(`📚 Found ${stats.total} books to process\n`);

    // Process in batches
    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(books.length / batchSize);

      console.log(`\n📦 Processing Batch ${batchNum}/${totalBatches} (Books ${i + 1}-${Math.min(i + batchSize, books.length)})`);
      console.log('─'.repeat(80));

      // Process books SEQUENTIALLY within batch to avoid rate limits
      for (const book of batch) {
        try {
          // Skip if already has good content and not forcing
          const hasGoodContent = book.summary && book.summary.length > 500;
          if (!forceRegenerate && hasGoodContent) {
            console.log(`⏭️  Skipped: "${book.title}" (already has content)`);
            stats.skipped++;
            return;
          }

          stats.processed++;
          console.log(`\n🔄 Processing: "${book.title}" by ${book.author}`);

          if (dryRun) {
            console.log('   [DRY RUN] Would generate summary');
            stats.success++;
            return;
          }

          // Generate enhanced summary
          const categories = book.tags ? book.tags.split(',').map(t => t.trim()) : undefined;
          const enhanced = await aiSummaryService.generateEnhancedSummary({
            title: book.title,
            author: book.author,
            categories: categories,
            publishedDate: book.publishedYear ? `${book.publishedYear}-01-01` : undefined
          });

          // Update database - convert arrays to JSON strings
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

          console.log(`   ✅ Success: Generated ${enhanced.keyInsights.length} insights, ${enhanced.chapterSummaries.length} chapters`);
          stats.success++;

        } catch (error) {
          console.error(`   ❌ Failed: "${book.title}"`, error instanceof Error ? error.message : error);
          stats.failed++;
        }
        
        // Small delay between books within batch (4 seconds = 15 requests per minute)
        await new Promise(resolve => setTimeout(resolve, 4000));
      }

      // Delay between batches (except for last batch)
      if (i + batchSize < books.length) {
        console.log(`\n⏳ Waiting ${delayMs}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Print final statistics
    console.log('\n' + '='.repeat(80));
    console.log('📊 REGENERATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total books:        ${stats.total}`);
    console.log(`Processed:          ${stats.processed}`);
    console.log(`✅ Success:         ${stats.success}`);
    console.log(`❌ Failed:          ${stats.failed}`);
    console.log(`⏭️  Skipped:         ${stats.skipped}`);
    console.log(`Success rate:       ${stats.processed > 0 ? ((stats.success / stats.processed) * 100).toFixed(1) : 0}%`);
    console.log('='.repeat(80));

    if (stats.failed > 0) {
      console.log('\n⚠️  Some books failed to regenerate. Check the logs above for details.');
    }

    if (dryRun) {
      console.log('\n💡 This was a DRY RUN. No changes were made to the database.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during regeneration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    batchSize: 5, // Reduced default to respect Gemini free tier
    delayMs: 5000, // Increased to stay under 15 RPM
    forceRegenerate: args.includes('--force'),
    dryRun: args.includes('--dry-run')
  };

  // Parse batch size
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  if (batchSizeArg) {
    options.batchSize = parseInt(batchSizeArg.split('=')[1]);
  }

  // Parse delay
  const delayArg = args.find(arg => arg.startsWith('--delay='));
  if (delayArg) {
    options.delayMs = parseInt(delayArg.split('=')[1]);
  }

  if (args.includes('--help')) {
    console.log(`
📚 BookDigest Summary Regeneration Tool

Usage:
  npm run regenerate:summaries [options]

Options:
  --force              Regenerate all summaries, even if they exist
  --dry-run            Show what would be done without making changes
  --batch-size=N       Process N books at a time (default: 10)
  --delay=MS           Wait MS milliseconds between batches (default: 2000)
  --help               Show this help message

Examples:
  npm run regenerate:summaries
  npm run regenerate:summaries -- --force
  npm run regenerate:summaries -- --dry-run
  npm run regenerate:summaries -- --batch-size=5 --delay=3000
  npm run regenerate:summaries -- --force --batch-size=20

Environment Variables:
  GEMINI_API_KEY       Required for AI-powered summaries (falls back to templates if missing)
  DATABASE_URL         PostgreSQL connection string

Note: Free tier of Gemini Pro allows 60 requests per minute. 
      Adjust batch-size and delay to stay within limits.
    `);
    process.exit(0);
  }

  await regenerateAllSummaries(options);
}

main()
  .then(() => {
    console.log('\n✨ Process completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Process failed:', error);
    process.exit(1);
  });
