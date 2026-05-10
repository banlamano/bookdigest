import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function countWords(str: string | null | undefined): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true }
  });

  let under1000 = 0;
  const list = [];

  for (const book of books) {
    const wc = countWords(book.summary);
    if (wc < 1000) {
      under1000++;
      list.push({ title: book.title, words: wc });
    }
  }

  console.log(`Total books with SUMMARY under 1000 words: ${under1000}`);
  console.log('Sample list:');
  console.dir(list.slice(0, 10));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
