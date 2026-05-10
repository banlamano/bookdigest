import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all EN books with good content (summary > 400 words)
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });

  const goodBooks = books
    .filter(b => (b.summary || '').split(/\s+/).length > 400)
    .map(b => ({
      title: b.title,
      words: (b.summary || '').split(/\s+/).length,
      updated: b.updatedAt
    }));

  const shortBooks = books.filter(b => (b.summary || '').split(/\s+/).length <= 400);

  const result = {
    totalGood: goodBooks.length,
    totalShort: shortBooks.length,
    finishedBooks: goodBooks.slice(0, 20).map(b => `${b.title} (${b.words}w)`)
  };

  fs.writeFileSync(path.resolve(process.cwd(), 'finished-books.json'), JSON.stringify(result, null, 2), 'utf-8');
}

main().finally(() => prisma.$disconnect());
