import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true, coverImage: true }
  });

  // Fetch all English books covers in one query to avoid N+1 queries
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, coverImage: true }
  });
  const enCoversMap = new Map<string, string | null>();
  for (const b of enBooks) {
    enCoversMap.set(b.title, b.coverImage);
  }

  let empty = 0;
  let olIsbn = 0;
  let sameAsEn = 0;
  let goodDe = 0;
  const needUpdate: string[] = [];

  for (const b of deBooks) {
    if (!b.coverImage || b.coverImage === '') {
      empty++;
      needUpdate.push(b.title);
      continue;
    }

    // Check if cover is same as the English original
    if (b.originalTitle) {
      const enCover = enCoversMap.get(b.originalTitle);
      if (enCover !== undefined && enCover === b.coverImage) {
        sameAsEn++;
        needUpdate.push(b.title);
        continue;
      }
    }

    // Check if it's an OpenLibrary ISBN cover (likely English edition)
    if (b.coverImage.includes('openlibrary.org/b/isbn/')) {
      olIsbn++;
      continue;
    }

    goodDe++;
  }

  console.log('=== German Cover Status ===');
  console.log(`Total DE books: ${deBooks.length}`);
  console.log(`Good DE covers (Google Books API): ${goodDe}`);
  console.log(`OpenLibrary ISBN covers: ${olIsbn}`);
  console.log(`Empty covers: ${empty}`);
  console.log(`Same cover as EN original: ${sameAsEn}`);
  console.log(`Need update (empty + same-as-EN): ${needUpdate.length}`);
  console.log('\nSample books needing cover updates:');
  needUpdate.slice(0, 20).forEach(t => console.log(`  - ${t}`));
}

main().finally(() => prisma.$disconnect());
