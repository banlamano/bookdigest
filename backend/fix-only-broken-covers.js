// CORRECT cover fixer - ONLY fixes broken OpenLibrary URLs
// PRESERVES all working covers (Google Books, etc.)
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGoogleBooksCover(title, author, isbn) {
  try {
    await sleep(3000); // 3 seconds between requests
    
    // Try ISBN first
    if (isbn) {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
        { timeout: 10000 }
      );
      
      const book = response.data.items?.[0];
      if (book?.volumeInfo?.imageLinks) {
        const links = book.volumeInfo.imageLinks;
        const cover = links.extraLarge || links.large || links.medium || 
                      links.small || links.thumbnail;
        if (cover) return cover.replace('http://', 'https://');
      }
    }

    // Fallback to title + author
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title + ' ' + author)}&maxResults=1`,
      { timeout: 10000 }
    );

    const book = response.data.items?.[0];
    if (book?.volumeInfo?.imageLinks) {
      const links = book.volumeInfo.imageLinks;
      const cover = links.extraLarge || links.large || links.medium || 
                    links.small || links.thumbnail;
      if (cover) return cover.replace('http://', 'https://');
    }

    return null;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log(`  ⚠️  Rate limited. Waiting 60s...`);
      await sleep(60000);
      return null; // Will retry on next run
    }
    console.log(`  ⚠️  Error: ${error.message}`);
    return null;
  }
}

async function fixOnlyBrokenCovers() {
  console.log('🔧 SMART Cover Fixer - Preserves Good Covers\n');
  console.log('This will ONLY fix broken OpenLibrary URLs');
  console.log('All working covers will be PRESERVED\n');

  const allBooks = await prisma.book.findMany({
    select: { id: true, title: true, author: true, coverImage: true, isbn: true },
  });

  console.log(`📚 Total books: ${allBooks.length}\n`);

  // Filter to ONLY broken covers
  const brokenBooks = allBooks.filter(book => 
    !book.coverImage || 
    book.coverImage.includes('openlibrary.org') ||
    book.coverImage.includes('placeholder')
  );

  const goodBooks = allBooks.length - brokenBooks.length;

  console.log(`✅ Books with GOOD covers: ${goodBooks} (will be preserved)`);
  console.log(`🔴 Books with BROKEN covers: ${brokenBooks.length} (will be fixed)\n`);

  if (brokenBooks.length === 0) {
    console.log('🎉 All covers are already good! Nothing to fix.');
    await prisma.$disconnect();
    return;
  }

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < brokenBooks.length; i++) {
    const book = brokenBooks[i];
    const prog = `[${i + 1}/${brokenBooks.length}]`;

    console.log(`${prog} 🔍 ${book.title.substring(0, 45)}...`);
    
    const newCover = await getGoogleBooksCover(book.title, book.author, book.isbn);

    if (newCover) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: newCover },
      });
      console.log(`${prog} ✅ FIXED - ${newCover.substring(0, 60)}...`);
      fixed++;
    } else {
      console.log(`${prog} ❌ Not found`);
      failed++;
    }

    // Progress report every 25 books
    if ((i + 1) % 25 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${brokenBooks.length} | Fixed: ${fixed} | Failed: ${failed}\n`);
    }
  }

  const finalGood = goodBooks + fixed;

  console.log('\n═══════════════════════════════════════');
  console.log('📊 FINAL RESULTS:');
  console.log('═══════════════════════════════════════');
  console.log(`Total books:           ${allBooks.length}`);
  console.log(`✅ Already good:       ${goodBooks} (preserved)`);
  console.log(`✅ Fixed:              ${fixed}`);
  console.log(`❌ Failed:             ${failed}`);
  console.log(`📈 Total working now:  ${finalGood}/${allBooks.length} (${((finalGood/allBooks.length)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

fixOnlyBrokenCovers()
  .then(() => {
    console.log('✅ Cover fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
