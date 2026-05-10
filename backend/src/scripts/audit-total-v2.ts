
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pageSize = 100;
  let hasMore = true;
  let lastId = undefined;

  const stats = {
    short: 0,   // < 800 words
    good: 0,    // 800 - 1500 words
    premium: 0  // > 1500 words
  };

  const shortBooks: any[] = [];

  while (hasMore) {
    const books = await prisma.book.findMany({
      take: pageSize,
      ...(lastId && { skip: 1, cursor: { id: lastId } }),
      select: {
        id: true,
        title: true,
        language: true,
        summary: true,
        keyInsights: true,
        chapters: true,
        actionItems: true,
        quotes: true
      }
    }) as any[];

    if (books.length === 0) {
      hasMore = false;
      break;
    }

    lastId = books[books.length - 1].id;

    for (const book of books) {
      let totalText = (book.summary || '');
      
      if (Array.isArray(book.keyInsights)) {
        book.keyInsights.forEach((ki: any) => {
          totalText += ' ' + (ki.explanation || '') + ' ' + (ki.title || '') + ' ' + (ki.example || '') + ' ' + (ki.impact || '');
        });
      }

      if (Array.isArray(book.chapters)) {
        book.chapters.forEach((ch: any) => {
          totalText += ' ' + (ch.summary || '') + ' ' + (ch.title || '');
        });
      }

      if (Array.isArray(book.actionItems)) {
        totalText += ' ' + book.actionItems.join(' ');
      }

      if (Array.isArray(book.quotes)) {
        totalText += ' ' + book.quotes.join(' ');
      }

      const wordCount = totalText.split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 800) {
        stats.short++;
        shortBooks.push({ id: book.id, title: book.title, lang: book.language, words: wordCount });
      } else if (wordCount < 1500) {
        stats.good++;
      } else {
        stats.premium++;
      }
    }
  }

  console.log('\n--- LIBRARY QUALITY AUDIT ---');
  console.log(`SHORT (<800 words):   ${stats.short}`);
  console.log(`GOOD (800-1500 words):  ${stats.good}`);
  console.log(`PREMIUM (>1500 words): ${stats.premium}`);
  
  if (stats.short > 0) {
    console.log('\nSample Short Books:');
    shortBooks.slice(0, 50).forEach(b => {
      console.log(`- ${b.title} [${b.lang}]: ${b.words} words`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
