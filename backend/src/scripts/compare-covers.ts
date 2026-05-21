import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { title: true, originalTitle: true, coverImage: true },
    take: 15
  });

  for (const deBook of deBooks) {
    if (!deBook.originalTitle) continue;
    const enBook = await prisma.book.findFirst({
      where: { language: 'en', title: deBook.originalTitle },
      select: { title: true, coverImage: true }
    });
    if (enBook) {
      const match = deBook.coverImage === enBook.coverImage;
      console.log(`Title: "${deBook.title}" (Original: "${deBook.originalTitle}")`);
      console.log(`  DE Cover: ${deBook.coverImage}`);
      console.log(`  EN Cover: ${enBook.coverImage}`);
      console.log(`  Same Cover? ${match ? 'YES' : 'NO'}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
