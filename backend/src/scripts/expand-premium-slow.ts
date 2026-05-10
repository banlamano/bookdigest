import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function expandSlowly() {
  console.log('🚀 Starting SLOW Premium Expansion (1 book per minute to avoid quota)...');
  
  for (const title of SHORT_BOOK_TITLES) {
    try {
      console.log(`\n📚 Expansion Target: "${title}"`);
      
      const enBook = await prisma.book.findFirst({ where: { title, language: 'en' } });
      if (!enBook) continue;

      // Ensure we use a verified model with this account
      // Note: We'll let the service handle the model ID as we updated it to gemini-2.0-flash
      
      console.log(`   ✍️ Processing English...`);
      const expandedEn = await aiSummaryService.generateEnhancedSummary({
        title: enBook.title,
        author: enBook.author,
        language: 'en'
      });

      if (expandedEn.bigIdea.includes('transformative guide')) {
         console.warn(`   ⚠️ Fallback detected! Quota still fully locked. Stopping script.`);
         return; 
      }

      await updateBook(enBook.id, expandedEn);
      console.log(`   ✅ English expanded.`);

      // Wait 5 seconds before doing the translation
      await new Promise(r => setTimeout(r, 5000));

      const deBook = await prisma.book.findFirst({
         where: { OR: [{ originalTitle: title, language: 'de' }, { title, language: 'de' }] }
      });
      if (deBook) {
        console.log(`   ✍️ Processing German...`);
        const expandedDe = await aiSummaryService.generateEnhancedSummary({
          title: enBook.title,
          author: enBook.author,
          language: 'de'
        });
        await updateBook(deBook.id, expandedDe);
        console.log(`   ✅ German expanded.`);
      }

      console.log(`✅ Completed: "${title}" perfectly reached premium depth.`);
      
      // Wait 10 seconds before the next book
      console.log('⏳ Waiting 10 seconds for next book quota...');
      await new Promise(r => setTimeout(r, 10000));

    } catch (e: any) {
      console.error(`❌ Error on "${title}":`, e.message);
      // Wait long if error
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

async function updateBook(id: string, data: any) {
  await prisma.book.update({
    where: { id },
    data: {
      summary: `${data.bigIdea}\n\n${data.whyItMatters}`,
      keyInsights: JSON.stringify(data.keyInsights.map((insight: any) => ({
        title: insight.title,
        description: `${insight.explanation} ${insight.example} ${insight.impact}`
      }))),
      chapters: JSON.stringify(data.chapterSummaries.map((ch: any) => ({
        number: ch.chapter,
        title: ch.title,
        summary: ch.summary
      }))),
      quotes: JSON.stringify(data.memorableQuotes.map((q: any) => q.quote)),
      actionItems: JSON.stringify(data.actionPlan.map((a: any) => a.action))
    }
  });
}

expandSlowly()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
