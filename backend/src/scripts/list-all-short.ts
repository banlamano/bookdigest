import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true, author: true }
  });

  const under1000: { title: string; author: string; words: number }[] = [];

  for (const book of books) {
    const wc = book.summary ? book.summary.trim().split(/\s+/).length : 0;
    if (wc < 1000) {
      under1000.push({ title: book.title, author: book.author, words: wc });
    }
  }

  under1000.sort((a, b) => a.words - b.words);

  console.log(`\nTotal English books with summary under 1000 words: ${under1000.length}\n`);
  for (const b of under1000) {
    console.log(`  [${b.words.toString().padStart(4)}w] ${b.title} — ${b.author}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
