// Simpler JavaScript version for better compatibility
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const path = require('path');

// Set DATABASE_URL for SQLite
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function getGoogleBooksCover(title, author, isbn) {
  try {
    // Add delay before each request to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Try ISBN first if available
    if (isbn) {
      const isbnQuery = `isbn:${isbn}`;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(isbnQuery)}`,
        { timeout: 10000 }
      );
      
      const book = response.data.items?.[0];
      if (book?.volumeInfo?.imageLinks) {
        const links = book.volumeInfo.imageLinks;
        const cover = links.extraLarge || links.large || links.medium || 
                      links.small || links.thumbnail || links.smallThumbnail;
        if (cover) {
          return cover.replace('http://', 'https://');
        }
      }
    }

    // Fallback to title + author
    const query = `${title} ${author}`;
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=3`,
      { timeout: 10000 }
    );

    if (response.data.items && response.data.items.length > 0) {
      for (const item of response.data.items) {
        if (item.volumeInfo?.imageLinks) {
          const links = item.volumeInfo.imageLinks;
          const cover = links.extraLarge || links.large || links.medium || 
                        links.small || links.thumbnail || links.smallThumbnail;
          if (cover) {
            return cover.replace('http://', 'https://');
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`  ⚠️  API Error: ${error.message}`);
    return null;
  }
}

async function fixCovers() {
  console.log('🚀 Starting cover fix process...\n');

  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
      isbn: true,
    },
  });

  console.log(`📚 Found ${books.length} books in database\n`);

  let fixed = 0;
  let alreadyGood = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const progress = `[${i + 1}/${books.length}]`;

    // Check if needs fixing
    const needsFix =
      !book.coverImage ||
      book.coverImage.includes('openlibrary.org') ||
      book.coverImage.includes('placeholder');

    if (!needsFix && book.coverImage.includes('googleapis.com')) {
      console.log(`${progress} ✅ ${book.title.substring(0, 50)}`);
      alreadyGood++;
      continue;
    }

    if (!needsFix) {
      console.log(`${progress} ⏭️  ${book.title.substring(0, 50)}`);
      skipped++;
      continue;
    }

    console.log(`${progress} 🔍 ${book.title.substring(0, 50)}...`);

    const newCover = await getGoogleBooksCover(book.title, book.author, book.isbn);

    if (newCover) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: newCover },
      });
      console.log(`${progress} ✅ FIXED`);
      fixed++;
    } else {
      console.log(`${progress} ❌ Not found`);
      failed++;
    }

    // Rate limit - 2 seconds between requests to avoid 429 errors
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Progress update every 50 books
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${books.length} | Fixed: ${fixed} | Failed: ${failed}\n`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 FINAL RESULTS:');
  console.log('═══════════════════════════════════════');
  console.log(`Total books:        ${books.length}`);
  console.log(`✅ Fixed:           ${fixed}`);
  console.log(`✅ Already good:    ${alreadyGood}`);
  console.log(`⏭️  Skipped:         ${skipped}`);
  console.log(`❌ Failed:          ${failed}`);
  console.log('═══════════════════════════════════════\n');

  const successRate = fixed + failed > 0 ? ((fixed / (fixed + failed)) * 100).toFixed(1) : 0;
  console.log(`Success rate: ${successRate}%`);
  console.log(`Total working: ${fixed + alreadyGood + skipped} / ${books.length}`);
  console.log(`Coverage: ${(((fixed + alreadyGood + skipped) / books.length) * 100).toFixed(1)}%\n`);

  await prisma.$disconnect();
}

fixCovers()
  .then(() => {
    console.log('✅ Cover fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
