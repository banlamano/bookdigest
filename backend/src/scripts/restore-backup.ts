import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient as PGClient } from '@prisma/client';
import { PrismaClient as SQLiteClient } from '@prisma/client';

// We need two clients. But they share the same generated types?
// No, the generated types are for the current schema.
// If the schema matches, we can just use the DB URL override.

async function main() {
  const pg = new PGClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  
  const sqlite = new PGClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
  });

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

  console.log('🔄 Attempting to RESTORE real summaries from local SQLite DB...');

  for (const title of SHORT_BOOK_TITLES) {
    const localBooks = await sqlite.book.findMany({
      where: { 
        OR: [ { title }, { originalTitle: title } ]
      }
    });

    if (localBooks.length === 0) {
      console.log(`   ❌ No local backup for: "${title}"`);
      continue;
    }

    for (const localBook of localBooks) {
      // Check if local book has "real" summary (not template)
      const isTemplate = localBook.summary?.includes('transformative guide') && localBook.summary?.includes('conventional thinking');
      
      if (isTemplate) {
        console.log(`   ⏩ Local copy is ALSO a template for: "${title}" [${localBook.language}]`);
        continue;
      }

      // Restore to Supabase
      console.log(`   ✅ RESTORING: "${title}" [${localBook.language}] (${localBook.summary?.split(/\s+/).length} words)`);
      
      const pgBook = await pg.book.findFirst({
        where: { 
          title: localBook.title,
          language: localBook.language
        }
      });

      if (pgBook) {
        await pg.book.update({
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

  await pg.$disconnect();
  await sqlite.$disconnect();
}

main().catch(console.error);
