import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { id: true, title: true }
  });

  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { originalTitle: true, title: true }
  });

  const deTitles = new Set(deBooks.map(b => b.originalTitle || b.title));
  
  const missing = [];
  for (const en of enBooks) {
    if (!deTitles.has(en.title)) {
      missing.push(en);
    }
  }

  console.log(`Found ${missing.length} missing books:`);
  console.dir(missing);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
