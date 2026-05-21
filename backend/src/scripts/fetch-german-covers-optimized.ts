import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';

async function main() {
  console.log('⚡ Starting German Cover Synchronization...');
  
  if (!process.env.GOOGLE_BOOKS_API_KEY) {
    console.warn('⚠️ GOOGLE_BOOKS_API_KEY is not set in your .env file! Running unauthenticated.');
  }

  // 1. Fetch all English books covers to map them
  console.log('🔍 Fetching English book covers for reference...');
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, coverImage: true }
  });
  const enCoversMap = new Map<string, string | null>();
  for (const b of enBooks) {
    enCoversMap.set(b.title, b.coverImage);
  }
  console.log(`ℹ️ Mapped ${enBooks.length} English book covers.`);

  // 2. Fetch all German books
  console.log('🔍 Fetching German books...');
  const germanBooks = await prisma.book.findMany({
    where: { language: 'de' }
  });
  console.log(`📚 Found ${germanBooks.length} German books in database.`);

  // 3. Filter German books that need cover updates (empty or matching English covers)
  const booksToUpdate = germanBooks.filter(b => {
    if (!b.coverImage || b.coverImage.trim() === '') return true;
    if (b.originalTitle) {
      const enCover = enCoversMap.get(b.originalTitle);
      if (enCover !== undefined && enCover === b.coverImage) return true;
    }
    return false;
  });

  console.log(`🎯 Found ${booksToUpdate.length} German books that need authentic covers.\n`);

  if (booksToUpdate.length === 0) {
    console.log('✨ All German book covers are already authentic and localized!');
    return;
  }

  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  let index = 0;

  for (const book of booksToUpdate) {
    index++;
    const progress = `[${index}/${booksToUpdate.length}]`;
    console.log(`${progress} Analyzing "${book.title}" (Original: "${book.originalTitle || 'N/A'}")`);

    try {
      // Query Google Books API specifically for German edition
      const query = encodeURIComponent(`intitle:${book.title} inauthor:${book.author}`);
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=de${apiKey}`;
      
      const response = await fetch(url);
      const data: any = await response.json();

      if (data.error) {
        if (data.error.code === 429) {
          console.error(`💥 Google Books API Rate limit exceeded! (429 Error) Stopping process.`);
          break;
        }
        console.error(`❌ Google Books API Error for "${book.title}":`, data.error.message);
        errorCount++;
        continue;
      }

      let bestCoverUrl: string | null = null;
      let foundMethod = '';

      if (data.items && data.items.length > 0) {
        // Find the first item with a thumbnail in German
        const itemWithCover = data.items.find((item: any) => 
          item.volumeInfo?.imageLinks?.thumbnail && 
          (item.volumeInfo.language === 'de' || !item.volumeInfo.language)
        );
        
        if (itemWithCover) {
          bestCoverUrl = itemWithCover.volumeInfo.imageLinks.thumbnail;
          foundMethod = 'Title + Author Search';
        }
      }

      // Fallback 1: Query by just Title (in German)
      if (!bestCoverUrl) {
        const titleQuery = encodeURIComponent(`intitle:${book.title}`);
        const titleUrl = `https://www.googleapis.com/books/v1/volumes?q=${titleQuery}&langRestrict=de${apiKey}`;
        const titleResponse = await fetch(titleUrl);
        const titleData: any = await titleResponse.json();

        if (titleData.items && titleData.items.length > 0) {
          const itemWithCover = titleData.items.find((item: any) => 
            item.volumeInfo?.imageLinks?.thumbnail && 
            (item.volumeInfo.language === 'de' || !item.volumeInfo.language)
          );
          if (itemWithCover) {
            bestCoverUrl = itemWithCover.volumeInfo.imageLinks.thumbnail;
            foundMethod = 'Title Fallback Search';
          }
        }
      }

      // Fallback 2: Query by original English title with German language restriction
      if (!bestCoverUrl && book.originalTitle) {
        const origQuery = encodeURIComponent(`intitle:${book.originalTitle}`);
        const origUrl = `https://www.googleapis.com/books/v1/volumes?q=${origQuery}&langRestrict=de${apiKey}`;
        const origResponse = await fetch(origUrl);
        const origData: any = await origResponse.json();

        if (origData.items && origData.items.length > 0) {
          const itemWithCover = origData.items.find((item: any) => 
            item.volumeInfo?.imageLinks?.thumbnail && 
            item.volumeInfo.language === 'de'
          );
          if (itemWithCover) {
            bestCoverUrl = itemWithCover.volumeInfo.imageLinks.thumbnail;
            foundMethod = 'Original Title Fallback Search';
          }
        }
      }

      if (bestCoverUrl) {
        // Clean up Google Books URL: force https and request high quality zoom=3
        let coverUrl = bestCoverUrl.replace('http:', 'https:');
        
        // Improve resolution from zoom=1 or zoom=5 to zoom=3
        if (coverUrl.includes('zoom=')) {
          coverUrl = coverUrl.replace(/zoom=\d/, 'zoom=3');
        } else {
          coverUrl = `${coverUrl}&zoom=3`;
        }

        // Add edge=curl to remove curl or make clean if needed, or leave it
        
        await prisma.book.update({
          where: { id: book.id },
          data: { coverImage: coverUrl }
        });

        console.log(`   ✨ Success! Cover updated using ${foundMethod}.`);
        console.log(`   🔗 URL: ${coverUrl.substring(0, 80)}...`);
        updatedCount++;
      } else {
        console.log(`   ⚠️ No German cover found in API.`);
        notFoundCount++;
      }

      // Respect Google API rate limits (approx 1 request per second)
      await new Promise(r => setTimeout(r, 1200));

    } catch (e: any) {
      console.error(`   ❌ Exception processing book:`, e.message);
      errorCount++;
    }
  }

  console.log('\n=============================================');
  console.log('🎉 Sync Complete!');
  console.log(`   ✅ Successful Updates: ${updatedCount}`);
  console.log(`   ⚠️ Covers Not Found:   ${notFoundCount}`);
  console.log(`   ❌ Processing Errors:   ${errorCount}`);
  console.log(`   📚 Remaining Needed:  ${booksToUpdate.length - updatedCount}`);
  console.log('=============================================\n');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
