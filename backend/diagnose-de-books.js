require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  // Get all German books
  const all = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, author: true, slug: true, originalTitle: true, coverImage: true },
    orderBy: { title: 'asc' }
  });

  const total = all.length;
  const nullCover = all.filter(b => !b.coverImage).length;
  const aiCover = all.filter(b => b.coverImage && b.coverImage.startsWith('/ai-covers')).length;
  const httpCover = all.filter(b => b.coverImage && b.coverImage.startsWith('http')).length;
  const nullSlug = all.filter(b => !b.slug).length;

  console.log(`=== German Books Diagnosis ===`);
  console.log(`Total German books: ${total}`);
  console.log(`  No/null cover:   ${nullCover}`);
  console.log(`  /ai-covers/ URL: ${aiCover}`);
  console.log(`  http cover URL:  ${httpCover}`);
  console.log(`  Null/empty slug: ${nullSlug}`);

  const noCovers = all.filter(b => !b.coverImage);
  console.log(`\n--- All ${noCovers.length} German books WITHOUT a cover ---`);
  noCovers.forEach(b => {
    console.log(`  slug="${b.slug || 'NULL'}" | "${b.title}" by ${b.author} | origTitle="${b.originalTitle || 'NULL'}"`);
  });

  const withCovers = all.filter(b => b.coverImage && b.coverImage.startsWith('http')).slice(0, 5);
  console.log(`\n--- Sample 5 books WITH http covers ---`);
  withCovers.forEach(b => console.log(`  "${b.title}" => ${b.coverImage}`));

  await prisma.$disconnect();
}
diagnose();
