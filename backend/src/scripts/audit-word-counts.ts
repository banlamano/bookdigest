import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function countWords(str: any): number {
  if (typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function calculateBookWordCount(book: any): number {
  let count = 0;
  
  // 1. Summary
  count += countWords(book.summary);
  
  // 2. Chapters
  if (Array.isArray(book.chapters)) {
    book.chapters.forEach((ch: any) => {
      count += countWords(ch.title);
      count += countWords(ch.summary);
      count += countWords(ch.keyTakeaway);
    });
  }
  
  // 3. Key Insights
  if (Array.isArray(book.keyInsights)) {
    book.keyInsights.forEach((ki: any) => {
      count += countWords(ki.title);
      count += countWords(ki.description);
      count += countWords(ki.explanation);
      count += countWords(ki.example);
      count += countWords(ki.impact);
    });
  }

  // 4. Action Items
  if (Array.isArray(book.actionItems)) {
    book.actionItems.forEach((ai: any) => {
      if (typeof ai === 'string') {
        count += countWords(ai);
      } else {
        count += countWords(ai?.action);
        count += countWords(ai?.outcome);
      }
    });
  }

  // 5. Quotes
  if (Array.isArray(book.quotes)) {
    book.quotes.forEach((q: any) => {
      if (typeof q === 'string') {
        count += countWords(q);
      } else {
        count += countWords(q?.quote);
        count += countWords(q?.context);
        count += countWords(q?.significance);
      }
    });
  }

  return count;
}

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { 
      id: true, 
      title: true, 
      summary: true, 
      chapters: true, 
      keyInsights: true, 
      actionItems: true, 
      quotes: true 
    }
  });

  const results = books.map(book => ({
    title: book.title,
    wordCount: calculateBookWordCount(book)
  }));

  const under1000 = results.filter(r => r.wordCount < 1000);
  const under500 = results.filter(r => r.wordCount < 500);

  console.log(`--- Word Count Audit ---`);
  console.log(`Total English Books:    ${books.length}`);
  console.log(`Books under 1000 words: ${under1000.length}`);
  console.log(`Books under 500 words:  ${under500.length}`);
  console.log('');
  
  if (under1000.length > 0) {
    console.log('List of all 13 books under 1000 words:');
    under1000.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.wordCount} words)`);
    });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
