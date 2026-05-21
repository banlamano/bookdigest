import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true, coverImage: true }
  });

  let emptyCovers = 0;
  let olCovers = 0;
  let matchingEnCovers = 0;
  let updatedDeCovers = 0;

  const toUpdate: any[] = [];

  for (const deBook of deBooks) {
    if (!deBook.coverImage) {
      emptyCovers++;
      toUpdate.push(deBook);
      continue;
    }

    if (deBook.coverImage.includes('openlibrary.org/b/isbn/')) {
      olCovers++;
      toUpdate.push(deBook);
      continue;
    }

    if (deBook.originalTitle) {
      const enBook = await prisma.book.findFirst({
        where: { language: 'en', title: deBook.originalTitle },
        select: { coverImage: true }
      });
      if (enBook && enBook.coverImage === deBook.coverImage) {
        matchingEnCovers++;
        toUpdate.push(deBook);
        continue;
      }
    }

    updatedDeCovers++;
  }

  console.log(`Total German books: ${deBooks.length}`);
  console.log(`  Empty covers: ${emptyCovers}`);
  console.log(`  OpenLibrary ISBN covers (likely English): ${olCovers}`);
  console.log(`  Covers identical to English original: ${matchingEnCovers}`);
  console.log(`  Successfully localized German covers: ${updatedDeCovers}`);
  console.log(`  Total needing updates: ${toUpdate.length}`);

  console.log('\nSample books needing updates:');
  console.log(JSON.stringify(toUpdate.slice(0, 10), null, 2));
}

main().finally(() => prisma.$disconnect());
