import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as path from 'path';

// Set DATABASE_URL for SQLite
const dbPath = path.join(__dirname, '..', '..', 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;
console.log('Using database:', dbPath);

const prisma = new PrismaClient();

interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo?: {
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
        small?: string;
        medium?: string;
        large?: string;
        extraLarge?: string;
      };
    };
  }>;
}

async function getGoogleBooksCover(
  title: string,
  author: string,
  isbn?: string
): Promise<string | null> {
  try {
    // Try ISBN first if available (most accurate)
    if (isbn) {
      const isbnQuery = `isbn:${isbn}`;
      const response = await axios.get<GoogleBooksResponse>(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(isbnQuery)}`
      );
      
      const book = response.data.items?.[0];
      if (book?.volumeInfo?.imageLinks) {
        const links = book.volumeInfo.imageLinks;
        // Get highest quality available
        const cover = links.extraLarge || links.large || links.medium || 
                      links.small || links.thumbnail || links.smallThumbnail;
        if (cover) {
          // Replace http with https for security
          return cover.replace('http://', 'https://');
        }
      }
    }

    // Fallback to title + author search
    const query = `${title} ${author}`;
    const response = await axios.get<GoogleBooksResponse>(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=3`
    );

    // Try to find best match
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
    console.error(`Error fetching cover for "${title}":`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function fixAllCovers() {
  console.log('🚀 Starting cover fix process...\n');

  // Get all books
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

    // Check if current cover needs fixing
    const needsFix =
      !book.coverImage || // No cover at all
      book.coverImage.includes('openlibrary.org') || // Broken OpenLibrary
      book.coverImage.includes('placeholder'); // Placeholder

    if (!needsFix && book.coverImage.includes('googleapis.com')) {
      console.log(`${progress} ✅ Already good: ${book.title}`);
      alreadyGood++;
      continue;
    }

    if (!needsFix) {
      console.log(`${progress} ⏭️  Skipping: ${book.title} (has working cover)`);
      skipped++;
      continue;
    }

    console.log(`${progress} 🔍 Fixing: ${book.title} by ${book.author}`);

    const newCover = await getGoogleBooksCover(
      book.title,
      book.author,
      book.isbn || undefined
    );

    if (newCover) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: newCover },
      });
      console.log(`${progress} ✅ Fixed: ${book.title}`);
      console.log(`          URL: ${newCover.substring(0, 80)}...\n`);
      fixed++;
    } else {
      console.log(`${progress} ❌ No cover found: ${book.title}\n`);
      failed++;
    }

    // Rate limit: 1 request per second to be nice to Google
    if (i < books.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const successRate = ((fixed / (fixed + failed)) * 100).toFixed(1);
  console.log(`Success rate: ${successRate}%`);
  console.log(`Total working covers: ${fixed + alreadyGood + skipped} / ${books.length}`);
  console.log(`Coverage: ${(((fixed + alreadyGood + skipped) / books.length) * 100).toFixed(1)}%\n`);

  await prisma.$disconnect();
}

// Run the script
fixAllCovers()
  .then(() => {
    console.log('✅ Cover fix process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
