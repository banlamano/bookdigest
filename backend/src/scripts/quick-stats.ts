import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({ select: { title: true, language: true, summary: true } });
  
  let shortest = books[0];
  let minWords = Infinity;
  let totalWords = 0;
  
  for (const b of books) {
    const w = (b.summary || '').trim().split(/\s+/).length;
    totalWords += w;
    if (w < minWords) {
      minWords = w;
      shortest = b;
    }
  }
  
  console.log(`=== EXCITING STATS ===`);
  console.log(`TOTAL WORDS IN SUMMARIES: ${totalWords}`);
  console.log(`SHORTEST BOOK: "${shortest.title}" (${shortest.language.toUpperCase()}) -> ${minWords} words`);
}
main().finally(() => prisma.$disconnect());
