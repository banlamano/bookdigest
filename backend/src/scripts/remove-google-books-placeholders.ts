import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_SIZES = [9103, 12321];

async function main() {
  console.log('🧹 Cleaning up Google Books placeholders...');
  
  const books = await prisma.book.findMany({
    where: { coverImage: { contains: 'books.google.com' } },
    select: { id: true, title: true, coverImage: true }
  });

  console.log(`Found ${books.length} books with Google Books covers.`);
  
  let removedCount = 0;

  for (const book of books) {
    if (!book.coverImage) continue;
    try {
      const res = await fetch(book.coverImage);
      if (!res.ok) continue;
      
      const buf = await res.arrayBuffer();
      const size = buf.byteLength;
      
      if (PLACEHOLDER_SIZES.includes(size)) {
        console.log(`Removing placeholder for "${book.title}" (size: ${size} bytes)`);
        await prisma.book.update({
          where: { id: book.id },
          data: { coverImage: '' } // This will trigger the OptimizedBookCover SVG generator
        });
        removedCount++;
      }
    } catch (err) {
      console.error(`Error checking cover for "${book.title}":`, err);
    }
  }

  console.log(`\n✅ Done! Removed ${removedCount} placeholder covers.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
