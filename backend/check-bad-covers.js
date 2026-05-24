const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, coverImage: true, language: true }
  });
  
  console.log(`Total books: ${books.length}`);
  
  const badCovers = books.filter(b => b.coverImage && (b.coverImage.includes('nophoto') || b.coverImage.includes('no_image') || b.coverImage.includes('blank')));
  
  console.log(`Bad covers found by string matching: ${badCovers.length}`);
  badCovers.forEach(b => console.log(`- [${b.language}] ${b.title}: ${b.coverImage}`));

  // Also check if any covers are missing (null/empty)
  const missingCovers = books.filter(b => !b.coverImage || b.coverImage.trim() === '');
  console.log(`Missing covers: ${missingCovers.length}`);
  
  await prisma.$disconnect();
}

run().catch(console.error);
