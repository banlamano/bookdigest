require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, coverImage: true, isbn: true, language: true },
    orderBy: { language: 'asc' }
  });

  let aiCount = 0, olCount = 0, gbCount = 0, otherCount = 0, nullCount = 0;
  
  for (const b of books) {
    if (!b.coverImage) { nullCount++; continue; }
    if (b.coverImage.startsWith('/ai-covers/')) aiCount++;
    else if (b.coverImage.includes('openlibrary.org')) olCount++;
    else if (b.coverImage.includes('googleapis.com') || b.coverImage.includes('google.com')) gbCount++;
    else otherCount++;
  }

  console.log(`Total books: ${books.length}`);
  console.log(`AI covers: ${aiCount}`);
  console.log(`OpenLibrary covers: ${olCount}`);
  console.log(`Google Books covers: ${gbCount}`);
  console.log(`Other covers: ${otherCount}`);
  console.log(`Null/empty: ${nullCount}`);
  
  // Show a few German books
  const deBooks = books.filter(b => b.language === 'de');
  console.log(`\nGerman books: ${deBooks.length}`);
  console.log('\nFirst 10 German book covers:');
  deBooks.slice(0, 10).forEach(b => {
    console.log(`  [${b.title}] => ${b.coverImage}`);
  });
  
  // Show AI cover books
  const aiBooks = books.filter(b => b.coverImage && b.coverImage.startsWith('/ai-covers/'));
  console.log(`\nBooks with AI covers (${aiBooks.length}):`);
  aiBooks.slice(0, 25).forEach(b => {
    console.log(`  [${b.language}] ${b.title} => ${b.coverImage}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
