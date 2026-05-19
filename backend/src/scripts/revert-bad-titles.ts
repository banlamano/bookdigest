import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// These are WRONG titles that were set by the bad script run
// Format: { id: bookId, correctTitle: 'original English title' }
// We need to find all German books and restore their titles to the originalTitle or reset bad ones.

async function main() {
  console.log('🔄 Reverting bad German title updates...\n');

  // Get all German books where the title looks clearly wrong
  // A "bad" title update would be when the title bears no resemblance to the original
  // We'll identify them by checking the originalTitle field, and if title is clearly wrong
  
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true },
  });

  // Known bad title mappings to revert (wrong title -> correct English title)
  const badTitles: Record<string, string> = {
    "A Tale of Two Cities": null as any, // these got set on multiple books, we need to identify by originalTitle
    "Alice's Adventures in Wonderland": null as any,
    "Loving": null as any,
    "The One Plus One": null as any,
    "How to Stop Worrying and Start Living": null as any,
    "Jab, jab, jab, right hook": null as any,
    "Guns, germs, and steel": null as any, // this is same title, ok actually
  };

  let reverted = 0;

  for (const book of books) {
    const titleLower = book.title.toLowerCase();
    
    // Check if title is clearly wrong (not related to the book's original/author context)
    // If originalTitle exists and doesn't match current title, and current title is in badTitles list
    const isBadTitle = Object.keys(badTitles).some(bad => 
      book.title === bad || titleLower === bad.toLowerCase()
    );
    
    if (isBadTitle && book.originalTitle) {
      console.log(`🔄 Reverting: "${book.title}" → "${book.originalTitle}" (${book.author})`);
      await prisma.book.update({
        where: { id: book.id },
        data: { title: book.originalTitle }
      });
      reverted++;
    } else if (isBadTitle) {
      // We don't have originalTitle, just log it
      console.log(`⚠️  Suspicious title but no originalTitle to revert to: "${book.title}" by ${book.author} (id: ${book.id})`);
    }
  }

  console.log(`\n✅ Reverted ${reverted} bad title(s).`);
  
  // Also count how many titles look like non-English but ok
  const goodGermanTitles = books.filter(b => {
    const isGermanLooking = /[äöüßÄÖÜ]/.test(b.title) || 
      /^(Die |Der |Das |Ein |Eine )/.test(b.title);
    return isGermanLooking;
  });
  console.log(`\n📊 Books with apparent German titles: ${goodGermanTitles.length}/${books.length}`);
  goodGermanTitles.slice(0, 10).forEach(b => console.log(`  - "${b.title}" by ${b.author}`));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
