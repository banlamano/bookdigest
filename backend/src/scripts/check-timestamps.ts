import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHORT_BOOK_TITLES = [
  'How to Win at the Sport of Business',
  'The Bogleheads\' Guide to Investing',
  'The Man Who Mistook His Wife for a Hat',
  'True Refuge',
  'The Small Big',
  'The Power of Moments',
  'The Buddha and the Badass',
  'Grit',
  'Redirect',
  'The Monk Who Sold His Ferrari',
  'Perennial Seller',
  'Company of One',
  'Powerful'
];

async function checkTimestamps() {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { in: SHORT_BOOK_TITLES } },
        { originalTitle: { in: SHORT_BOOK_TITLES } }
      ]
    },
    select: { title: true, language: true, updatedAt: true, summary: true }
  });
  
  console.log('| Title | Lang | Words | Updated At |');
  console.log('|-------|------|-------|------------|');
  
  for (const book of books) {
    const wc = book.summary ? book.summary.split(/\s+/).length : 0;
    console.log(`| ${book.title} | ${book.language} | ${wc} | ${book.updatedAt.toISOString()} |`);
  }
}

checkTimestamps().catch(console.error).finally(() => prisma.$disconnect());
