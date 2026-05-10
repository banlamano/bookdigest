import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

const prisma = new PrismaClient();
const db = new Database(path.resolve(process.cwd(), 'prisma/dev.db'));

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
  console.log('🔄 Restoring real summaries from local SQLite...');

  for (const title of SHORT_BOOK_TITLES) {
    // Find all entries for this title in SQLite
    const localBooks = db.prepare('SELECT * FROM Book WHERE title = ? OR originalTitle = ?').all(title, title);

    if (localBooks.length === 0) {
      console.log(`   ❌ No backup for: "${title}"`);
      continue;
    }

    for (const localBook of localBooks as any[]) {
      const isTemplate = localBook.summary?.includes('transformative guide') && localBook.summary?.includes('conventional thinking');
      
      if (isTemplate) {
        console.log(`   ⏩ SQLite copy is also a template for: "${title}" [${localBook.language}]`);
        continue;
      }

      console.log(`   ✅ Restoring REAL content for: "${title}" [${localBook.language}] (${localBook.summary?.split(/\s+/).length} words)`);
      
      const pgBook = await prisma.book.findFirst({
        where: { 
          title: localBook.title,
          language: localBook.language
        }
      });

      if (pgBook) {
        await prisma.book.update({
          where: { id: pgBook.id },
          data: {
            summary: localBook.summary,
            keyInsights: localBook.keyInsights,
            chapters: localBook.chapters,
            quotes: localBook.quotes,
            actionItems: localBook.actionItems
          }
        });
      }
    }
  }

  console.log('\n✨ Restore complete. All target books are back to "Real" content (but still short).');
}

main().catch(console.error).finally(() => { prisma.$disconnect(); db.close(); });
