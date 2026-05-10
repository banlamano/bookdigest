import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from '../services/ai-summary.service';

const prisma = new PrismaClient();

// List of 13 books to expand (Found by word count < 1000)
const SHORT_BOOK_TITLES = [
  'How to Win at the Sport of Business',
  'The Bogleheads\' Guide to Investing',
  'The Man Who Mistook His Wife for a Hat',
  'True Refuge',
  'The Small Big',
  'The Power of Moments',
  'The Buddha and the Badass',
  'Grit',
  'Redirect',
  'The Monk Who Sold His Ferrari',
  'Perennial Seller',
  'Company of One',
  'Powerful'
];

async function expandBooks() {
  console.log('🚀 Starting Expansion of 13 Short Books to 2000+ words...\n');

  if (!aiSummaryService.isAvailable()) {
    console.error('❌ AI Service not available. Check GEMINI_API_KEY.');
    return;
  }

  for (const title of SHORT_BOOK_TITLES) {
    try {
      console.log(`\n📚 Processing: "${title}"`);
      
      // 1. Find the English book
      const englishBook = await prisma.book.findFirst({
        where: { title, language: 'en' }
      });

      if (!englishBook) {
        console.warn(`   ⚠️ English version of "${title}" not found. Skipping.`);
        continue;
      }

      // 2. Expand English summary
      console.log('   ✍️  Expanding English version...');
      const expandedEn = await aiSummaryService.generateEnhancedSummary({
        title: englishBook.title,
        author: englishBook.author,
        language: 'en'
      });

      await updateBookData(englishBook.id, expandedEn);
      console.log('   ✅ English expanded.');

      // 3. Find and Expand German version (to keep them in sync)
      const germanBook = await prisma.book.findFirst({
        where: { 
          OR: [
            { originalTitle: title, language: 'de' },
            { title: title, language: 'de' } // Fallback for direct matches
          ]
        }
      });

      if (germanBook) {
        console.log('   ✍️  Expanding German version...');
        const expandedDe = await aiSummaryService.generateEnhancedSummary({
          title: englishBook.title, // Use original title for better context
          author: englishBook.author,
          language: 'de'
        });

        await updateBookData(germanBook.id, expandedDe);
        console.log('   ✅ German expanded.');
      } else {
        console.warn(`   ⚠️ German version of "${title}" not found.`);
      }

      // Respect API rate limits (15 RPM for free tier)
      await new Promise(r => setTimeout(r, 6000));

    } catch (error: any) {
      console.error(`   ❌ Failed to expand "${title}":`, error.message);
    }
  }

  console.log('\n✨ All 13 books (and their translations) have been expanded!');
}

async function updateBookData(id: string, enhanced: any) {
  await prisma.book.update({
    where: { id },
    data: {
      summary: `${enhanced.bigIdea}\n\n${enhanced.whyItMatters}`,
      keyInsights: JSON.stringify(enhanced.keyInsights.map((insight: any) => ({
        title: insight.title,
        description: `${insight.explanation} ${insight.example} ${insight.impact}`
      }))),
      chapters: JSON.stringify(enhanced.chapterSummaries.map((ch: any) => ({
        number: ch.chapter,
        title: ch.title,
        summary: ch.summary
      }))),
      quotes: JSON.stringify(enhanced.memorableQuotes.map((q: any) => q.quote)),
      actionItems: JSON.stringify(enhanced.actionPlan.map((a: any) => a.action))
    }
  });
}

expandBooks()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
