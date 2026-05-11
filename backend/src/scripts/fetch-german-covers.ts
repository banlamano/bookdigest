import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🇩🇪 Fetching authentic German covers from Google Books API...\n');
  
  const germanBooks = await prisma.book.findMany({
    where: { language: 'de' }
  });

  console.log(`📚 Found ${germanBooks.length} German books in the database.\n`);

  let updated = 0;
  let skipped = 0;

  for (const book of germanBooks) {
    try {
      // Query Google Books API specifically for German editions
      const query = encodeURIComponent(`intitle:${book.title} inauthor:${book.author}`);
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=de`;
      
      const response = await fetch(url);
      const data: any = await response.json();
      
      if (data.items && data.items.length > 0) {
        // Find the first item with a thumbnail
        const itemWithCover = data.items.find((item: any) => item.volumeInfo?.imageLinks?.thumbnail);
        
        if (itemWithCover) {
          // Google Books API returns http by default, ensure https
          let coverUrl = itemWithCover.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
          
          // Google Books trick: change zoom=1 to zoom=3 for higher quality cover
          coverUrl = coverUrl.replace('zoom=1', 'zoom=3');
          
          // Avoid unnecessary updates if it's already the same
          if (book.coverImage !== coverUrl) {
            await prisma.book.update({
              where: { id: book.id },
              data: { coverImage: coverUrl }
            });
            console.log(`✅ Updated cover for: "${book.title}"`);
            updated++;
          } else {
            skipped++;
          }
        } else {
          console.log(`⚠️ No cover found in API for: "${book.title}"`);
          skipped++;
        }
      } else {
        // Fallback: search just by title if author + title fails
        const titleQuery = encodeURIComponent(`intitle:${book.title}`);
        const titleUrl = `https://www.googleapis.com/books/v1/volumes?q=${titleQuery}&langRestrict=de`;
        const titleResponse = await fetch(titleUrl);
        const titleData: any = await titleResponse.json();
        
        if (titleData.items && titleData.items.length > 0) {
          const itemWithCover = titleData.items.find((item: any) => item.volumeInfo?.imageLinks?.thumbnail);
          if (itemWithCover) {
             let coverUrl = itemWithCover.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
             if (book.coverImage !== coverUrl) {
                await prisma.book.update({
                  where: { id: book.id },
                  data: { coverImage: coverUrl }
                });
                console.log(`✅ Updated cover for: "${book.title}" (Title fallback)`);
                updated++;
             } else {
               skipped++;
             }
          } else {
            console.log(`❌ No results found for: "${book.title}"`);
          }
        } else {
           console.log(`❌ No results found for: "${book.title}"`);
        }
      }
      
      // Respect Google API rate limits (approx 1 request per second)
      await new Promise(r => setTimeout(r, 1000));
    } catch (e: any) {
      console.error(`❌ Error processing "${book.title}":`, e.message);
    }
  }

  console.log(`\n✨ Finished! Updated ${updated} German covers. (Skipped/Already correct: ${skipped})`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
