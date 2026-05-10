import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { id: true, title: true, author: true, summary: true },
  });

  const shortBooks = books
    .filter(b => (b.summary || '').split(/\s+/).length < 500)
    .map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      words: (b.summary || '').split(/\s+/).length
    }))
    .sort((a, b) => a.words - b.words);

  fs.writeFileSync(
    path.resolve(process.cwd(), 'remaining-short.json'),
    JSON.stringify({ count: shortBooks.length, books: shortBooks }, null, 2),
    'utf-8'
  );
}

main().finally(() => prisma.$disconnect());
