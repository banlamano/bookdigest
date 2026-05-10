import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 1
  });

  if (books.length > 0) {
    const book = books[0];
    let wordCount = (book.summary || '').split(/\s+/).length;
    
    try {
      const ki = JSON.parse(String(book.keyInsights) || '[]');
      if (Array.isArray(ki)) {
          for (const item of ki) wordCount += String(item.explanation || item.description || '').split(/\s+/).length;
      }
    } catch(e) {}
    
    try {
      const ch = JSON.parse(String(book.chapters) || '[]');
      if (Array.isArray(ch)) {
          for (const item of ch) wordCount += String(item.summary || '').split(/\s+/).length;
      }
    } catch(e) {}
    
    console.log(`\nNewest Book Updated: ${book.title} (${book.language})`);
    console.log(`Total Word Count (Summary + Insights + Chapters): ~${wordCount} words`);
    console.log(`\nExcerpt from Summary:\n"${book.summary.substring(0, 300)}..."\n`);
  }
}

main().finally(() => prisma.$disconnect());
