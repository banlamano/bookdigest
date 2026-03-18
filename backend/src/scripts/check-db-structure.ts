import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check the German book
  const deBook = await prisma.book.findFirst({ where: { language: 'de' }, select: { id: true, title: true, author: true, originalTitle: true, summary: true } });
  console.log('German book:', JSON.stringify(deBook, null, 2));
  
  // Check an English book with the same title
  const enBook = await prisma.book.findFirst({ where: { title: 'The Giver of Stars', language: 'en' } });
  console.log('English version exists?', !!enBook);
  
  // Check how many books have originalTitle
  const withOriginal = await prisma.book.count({ where: { originalTitle: { not: null } } });
  console.log('Books with originalTitle:', withOriginal);
  
  // Sample English book to see content length
  const sample = await prisma.book.findFirst({ where: { language: 'en' }, select: { id: true, title: true, summary: true, keyInsights: true, chapters: true, quotes: true, actionItems: true } });
  console.log('\nSample EN book:', sample?.title);
  console.log('Summary length:', sample?.summary?.length);
  console.log('keyInsights type:', typeof sample?.keyInsights);
  console.log('keyInsights sample:', JSON.stringify(sample?.keyInsights).substring(0, 300));
  console.log('chapters sample:', JSON.stringify(sample?.chapters).substring(0, 300));
  console.log('quotes sample:', JSON.stringify(sample?.quotes).substring(0, 300));
  console.log('actionItems sample:', JSON.stringify(sample?.actionItems).substring(0, 300));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
