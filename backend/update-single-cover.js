// Update a single book's cover
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function updateSingleCover(bookId, coverUrl) {
  if (!bookId || !coverUrl) {
    console.log('❌ Usage: node update-single-cover.js <book-id> <cover-url>');
    console.log('\nExample:');
    console.log('  node update-single-cover.js 1 "https://example.com/cover.jpg"');
    process.exit(1);
  }

  try {
    // Get book info
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) },
      select: { id: true, title: true, author: true, coverImage: true }
    });

    if (!book) {
      console.log(`❌ Book with ID ${bookId} not found`);
      process.exit(1);
    }

    console.log('\n📖 Book Information:');
    console.log('═══════════════════════════════════════');
    console.log(`ID: ${book.id}`);
    console.log(`Title: ${book.title}`);
    console.log(`Author: ${book.author}`);
    console.log(`\nOld Cover: ${book.coverImage || 'NONE'}`);
    console.log(`New Cover: ${coverUrl}`);
    console.log('═══════════════════════════════════════\n');

    // Update
    await prisma.book.update({
      where: { id: parseInt(bookId) },
      data: { coverImage: coverUrl }
    });

    console.log('✅ Cover updated successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const bookId = process.argv[2];
const coverUrl = process.argv[3];

updateSingleCover(bookId, coverUrl);
