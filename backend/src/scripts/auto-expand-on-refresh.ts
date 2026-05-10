import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars (Production first)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

import { PrismaClient } from '@prisma/client';
import { aiSummaryService } from '../services/ai-summary.service';

const prisma = new PrismaClient();

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

async function main() {
  console.log('⏳ Quota Monitor: Waiting for Gemini API to refresh...\n');

  for (const title of SHORT_BOOK_TITLES) {
    let success = false;
    let attempts = 0;

    while (!success) {
      try {
        attempts++;
        console.log(`\n📚 [Attempt ${attempts}] Expanding: "${title}"`);
        
        const enBook = await prisma.book.findFirst({
          where: { title, language: 'en' }
        });

        if (!enBook) {
          console.log(`   ⏭️ English version not found for "${title}".`);
          success = true;
          continue;
        }

        // Expand English
        console.log(`   ✍️ Generating English summary for: ${title}`);
        const expandedEn = await aiSummaryService.generateEnhancedSummary({
          title: enBook.title,
          author: enBook.author,
          language: 'en'
        });

        // Validation: Verify it's not the fallback
        if (expandedEn.bigIdea.includes('transformative guide')) {
          throw new Error('Fallback detected (Quota still exhausted)');
        }

        await updateBook(enBook.id, expandedEn);
        console.log(`   ✅ English expanded.`);

        // Find German
        const deBook = await prisma.book.findFirst({
          where: {
            OR: [
              { originalTitle: title, language: 'de' },
              { title: title, language: 'de' }
            ]
          }
        });

        if (deBook) {
          console.log(`   ✍️ Generating German summary for: ${title}`);
          const expandedDe = await aiSummaryService.generateEnhancedSummary({
            title: enBook.title,
            author: enBook.author,
            language: 'de'
          });
          await updateBook(deBook.id, expandedDe);
          console.log(`   ✅ German expanded.`);
        }

        success = true;
        console.log(`✨ Successfully expanded "${title}" to 2000+ words.`);
        
        // Wait 10 seconds between records
        await new Promise(r => setTimeout(r, 10000));

      } catch (e: any) {
        if (e.message.includes('Quota') || e.message.includes('429') || e.message.includes('Fallback')) {
          console.log(`⚠️ Quota currently blocked: ${e.message}`);
          console.log('⏳ Waiting 30 minutes before next attempt...');
          await new Promise(r => setTimeout(r, 1800000)); // 30 minutes
        } else {
          console.error(`❌ Unexpected error for "${title}":`, e.message);
          success = true; // Move to next to avoid infinite loops on bad books
        }
      }
    }
  }

  console.log('\n🌟 Expansion Project Completed!');
}

async function updateBook(id: string, enhanced: any) {
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

main();
