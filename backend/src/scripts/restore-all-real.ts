import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

async function main() {
  const pg = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  
  const sqlite = new PrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
  });

  console.log('🔄 Searching for REAL content in local SQLite for ANY template book...');

  const pgBooks = await pg.book.findMany();
  let count = 0;

  for (const book of pgBooks) {
    const isTemplate = book.summary?.includes('transformative guide') && book.summary?.includes('conventional thinking');
    
    if (isTemplate) {
      const local = await sqlite.book.findFirst({
        where: { 
          title: book.title, 
          language: book.language 
        }
      });

      if (local && local.summary) {
        const localIsTemplate = local.summary.includes('transformative guide') && local.summary.includes('conventional thinking');
        if (!localIsTemplate && local.summary.length > 200) {
          console.log(`   ✅ Restoring: "${book.title}" [${book.language}] (${local.summary.split(/\s+/).length} words)`);
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
          count++;
        }
      }
    }
  }

  console.log(`\n✨ Restored ${count} books from local backup.`);
  await pg.$disconnect();
  await sqlite.$disconnect();
}

main().catch(console.error);
