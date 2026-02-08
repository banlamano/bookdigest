// List all books with missing or broken covers
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function listMissingCovers() {
  console.log('📋 Finding books with missing/broken covers...\n');

  const allBooks = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
      isbn: true,
    },
    orderBy: { title: 'asc' }
  });

  // Filter books with broken covers
  const brokenBooks = allBooks.filter(book => 
    !book.coverImage || 
    book.coverImage.includes('openlibrary.org') ||
    book.coverImage.includes('placeholder')
  );

  console.log(`Total books: ${allBooks.length}`);
  console.log(`Books with broken covers: ${brokenBooks.length}\n`);

  // Create CSV
  const csvLines = ['ID,Title,Author,ISBN,Current_Cover_URL'];
  
  brokenBooks.forEach(book => {
    const title = book.title.replace(/,/g, ';'); // Replace commas to avoid CSV issues
    const author = book.author.replace(/,/g, ';');
    const isbn = book.isbn || 'N/A';
    const currentCover = book.coverImage || 'NONE';
    
    csvLines.push(`${book.id},"${title}","${author}",${isbn},"${currentCover}"`);
  });

  const csvContent = csvLines.join('\n');
  fs.writeFileSync('missing-covers.csv', csvContent);

  console.log('✅ Created missing-covers.csv\n');
  console.log('First 10 books with missing covers:');
  console.log('═══════════════════════════════════════\n');
  
  brokenBooks.slice(0, 10).forEach((book, i) => {
    console.log(`${i + 1}. ID: ${book.id}`);
    console.log(`   Title: ${book.title}`);
    console.log(`   Author: ${book.author}`);
    console.log(`   ISBN: ${book.isbn || 'N/A'}`);
    console.log('');
  });

  if (brokenBooks.length > 10) {
    console.log(`... and ${brokenBooks.length - 10} more books\n`);
  }

  console.log('═══════════════════════════════════════');
  console.log('📄 Full list saved to: missing-covers.csv');
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

listMissingCovers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
