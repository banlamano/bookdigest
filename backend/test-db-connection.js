// Set DATABASE_URL directly
const path = require('path');
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;
console.log('Using database:', dbPath);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const count = await prisma.book.count();
    console.log('✅ Connected to production database!');
    console.log('Total books:', count);
    
    // Get sample of books with covers
    const sampleBooks = await prisma.book.findMany({
      take: 5,
      select: { title: true, author: true, coverImage: true }
    });
    
    console.log('\nSample books:');
    sampleBooks.forEach(b => {
      const status = b.coverImage ? (b.coverImage.includes('openlibrary.org') ? '🔴 BROKEN' : '✅ OK') : '❌ NONE';
      console.log(`  ${status} ${b.title}`);
    });
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
