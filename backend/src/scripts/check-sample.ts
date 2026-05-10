import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSample() {
  const book = await prisma.book.findFirst({
    where: { title: 'How to Win at the Sport of Business' }
  });
  
  if (book) {
    console.log('Book:', book.title);
    console.log('Summary length:', book.summary.split(/\s+/).length);
    console.log('Key Insights Type:', typeof book.keyInsights);
    console.log('Key Insights:', JSON.stringify(book.keyInsights, null, 2));
    console.log('Chapters Type:', typeof book.chapters);
    console.log('Chapters:', JSON.stringify(book.chapters, null, 2));
  }
}

checkSample().catch(console.error).finally(() => prisma.$disconnect());
