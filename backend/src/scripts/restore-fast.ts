import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
const Database = require('better-sqlite3');

async function main() {
  const pg = new PrismaClient();
  const db = new Database(path.join(process.cwd(), 'prisma/dev.db'));

  console.log('🔄 Checking all books in Supabase for templates...');
  const pgBooks = await pg.book.findMany();
  let restoredCount = 0;

  for (const book of pgBooks) {
    const isTemplate = book.summary?.includes('transformative guide') && book.summary?.includes('conventional thinking');
    
    if (isTemplate) {
      // Find in SQLite
      const local = db.prepare('SELECT summary, keyInsights, chapters, quotes, actionItems FROM Book WHERE title = ? AND language = ?').get(book.title, book.language);

      if (local && local.summary) {
        const localIsTemplate = local.summary.includes('transformative guide') && local.summary.includes('conventional thinking');
        if (!localIsTemplate && local.summary.length > 200) {
          console.log(`   ✅ Restoring REAL content for: "${book.title}" [${book.language}]`);
          await pg.book.update({
            where: { id: book.id },
            data: {
              summary: local.summary,
              keyInsights: local.keyInsights,
              chapters: local.chapters,
              quotes: local.quotes,
              actionItems: local.actionItems
            }
          });
          restoredCount++;
        }
      }
    }
  }

  console.log(`\n✨ Restored ${restoredCount} books from local SQLite.`);
  db.close();
  await pg.$disconnect();
}

main().catch(console.error);
