import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Applying English cover fallbacks for any remaining empty German covers...\n');

  // Fetch all German books and filter in-memory to avoid nullable schema validation issues
  const allDeBooks = await prisma.book.findMany({
    where: { language: 'de' }
  });

  const emptyDeBooks = allDeBooks.filter(b => !b.coverImage || b.coverImage.trim() === '');

  console.log(`🔍 Found ${emptyDeBooks.length} German books with completely empty covers.`);

  if (emptyDeBooks.length === 0) {
    console.log('✨ No German books have completely empty covers! All have valid covers.');
    return;
  }

  let updatedCount = 0;

  for (const book of emptyDeBooks) {
    if (!book.originalTitle) {
      console.log(`⚠️ Skip: "${book.title}" (No originalTitle listed to map)`);
      continue;
    }

    // Find the English original
    const enBook = await prisma.book.findFirst({
      where: {
        language: 'en',
        title: book.originalTitle
      },
      select: { title: true, coverImage: true }
    });

    if (enBook && enBook.coverImage && enBook.coverImage !== '') {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: enBook.coverImage }
      });
      console.log(`✅ Applied fallback cover for: "${book.title}" -> "${enBook.title}" cover.`);
      updatedCount++;
    } else {
      console.log(`❌ No fallback cover found in English original for: "${book.title}" (Original title: "${book.originalTitle}")`);
    }
  }

  console.log(`\n🎉 Applied English fallbacks to ${updatedCount} German books!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
