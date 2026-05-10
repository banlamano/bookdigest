
import { PrismaClient } from '@prisma/client';

async function checkSQLite() {
  const sqlite = new PrismaClient({
    datasources: { db: { url: 'file:../prisma/dev.db' } }
  });

  const books = await sqlite.book.findMany();
  let found = 0;
  for (const b of books) {
    let text = b.summary || '';
    if (Array.isArray(b.keyInsights)) {
      b.keyInsights.forEach((k: any) => text += ' ' + JSON.stringify(k));
    }
    if (Array.isArray(b.chapters)) {
      b.chapters.forEach((c: any) => text += ' ' + JSON.stringify(c));
    }
    const wc = text.split(/\s+/).length;
    if (wc > 1500) {
      found++;
      console.log(`[Backup db] High-quality book found: ${b.title} [${b.language}] (${wc} words)`);
    } else {
        // console.log(`[Backup db] Short book found: ${b.title} [${b.language}] (${wc} words)`);
    }
  }
  console.log(`\nFound ${found} Premium books in SQLite backup.`);
  await sqlite.$disconnect();
}

checkSQLite().catch(console.error);
