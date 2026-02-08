// Smart cover fixer with retry logic and resume capability
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

const PROGRESS_FILE = 'cover-fix-progress.json';
const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests
const RETRY_DELAY = 60000; // Wait 1 minute if rate limited

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGoogleBooksCover(title, author, isbn, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await sleep(RATE_LIMIT_DELAY);
      
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
        console.log(`  ⚠️  Rate limited. Waiting ${RETRY_DELAY/1000}s...`);
        await sleep(RETRY_DELAY);
        continue;
      }
      if (attempt === retries - 1) {
        console.log(`  ⚠️  Error: ${error.message}`);
        return null;
      }
      await sleep(2000);
    }
  }
  return null;
}

async function fixCovers() {
  console.log('🚀 Smart Cover Fixer with Resume Capability\n');

  // Load progress if exists
  let progress = { lastIndex: 0, fixed: 0, failed: 0, alreadyGood: 0, skipped: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`📂 Resuming from book #${progress.lastIndex + 1}\n`);
  }

  const books = await prisma.book.findMany({
    select: { id: true, title: true, author: true, coverImage: true, isbn: true },
  });

  console.log(`📚 Total books: ${books.length}`);
  console.log(`📍 Starting from: ${progress.lastIndex + 1}\n`);

  for (let i = progress.lastIndex; i < books.length; i++) {
    const book = books[i];
    const prog = `[${i + 1}/${books.length}]`;

    // Check if needs fixing
    const needsFix =
      !book.coverImage ||
      book.coverImage.includes('openlibrary.org') ||
      book.coverImage.includes('placeholder');

    if (!needsFix && book.coverImage.includes('googleapis.com')) {
      console.log(`${prog} ✅ ${book.title.substring(0, 45)}`);
      progress.alreadyGood++;
    } else if (!needsFix) {
      console.log(`${prog} ⏭️  ${book.title.substring(0, 45)}`);
      progress.skipped++;
    } else {
      console.log(`${prog} 🔍 ${book.title.substring(0, 45)}...`);
      
      const newCover = await getGoogleBooksCover(book.title, book.author, book.isbn);

      if (newCover) {
        await prisma.book.update({
          where: { id: book.id },
          data: { coverImage: newCover },
        });
        console.log(`${prog} ✅ FIXED`);
        progress.fixed++;
      } else {
        console.log(`${prog} ❌ Not found`);
        progress.failed++;
      }
    }

    // Update progress
    progress.lastIndex = i;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    // Progress report every 25 books
    if ((i + 1) % 25 === 0) {
      const total = progress.fixed + progress.alreadyGood + progress.skipped;
      console.log(`\n📊 Progress: ${i + 1}/${books.length} | Fixed: ${progress.fixed} | Working: ${total}/${i+1}\n`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 FINAL RESULTS:');
  console.log('═══════════════════════════════════════');
  console.log(`Total books:        ${books.length}`);
  console.log(`✅ Fixed:           ${progress.fixed}`);
  console.log(`✅ Already good:    ${progress.alreadyGood}`);
  console.log(`⏭️  Skipped:         ${progress.skipped}`);
  console.log(`❌ Failed:          ${progress.failed}`);
  console.log('═══════════════════════════════════════\n');

  const total = progress.fixed + progress.alreadyGood + progress.skipped;
  console.log(`Coverage: ${total}/${books.length} (${((total/books.length)*100).toFixed(1)}%)\n`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }

  await prisma.$disconnect();
}

fixCovers()
  .then(() => {
    console.log('✅ Cover fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
