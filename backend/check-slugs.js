require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlugs() {
  // Check the German Financial Freedom book specifically
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, slug: true, author: true },
    take: 20
  });
  
  console.log('German books with their DB slugs:\n');
  books.forEach(b => {
    console.log(`Title: "${b.title}"`);
    console.log(`  slug: ${b.slug || 'NULL'}`);
    console.log('');
  });

  // Count how many German books have null/empty slugs
  const nullSlug = await prisma.book.count({ where: { language: 'de', slug: null } });
  const emptySlug = await prisma.book.count({ where: { language: 'de', slug: '' } });
  const hasSlug = await prisma.book.count({ where: { language: 'de', NOT: [{ slug: null }, { slug: '' }] } });

  console.log(`\nSummary:`);
  console.log(`  Null slug: ${nullSlug}`);
  console.log(`  Empty slug: ${emptySlug}`);
  console.log(`  Has slug: ${hasSlug}`);
  
  await prisma.$disconnect();
}
checkSlugs();
