import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sampleEnglishBooks() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    take: 10
  });

  console.log('| ID | Title | Language | Summary (Start) |');
  console.log('|----|-------|----------|-----------------|');

  for (const book of books) {
    const startOfSummary = book.summary ? book.summary.substring(0, 100).replace(/\n/g, ' ') : '-';
    console.log(`| ${book.id} | ${book.title} | ${book.language} | ${startOfSummary} |`);
  }

  process.exit(0);
}

sampleEnglishBooks().catch(e => { console.error(e); process.exit(1); });
