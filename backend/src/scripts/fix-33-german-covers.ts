import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';

async function fetchCover(title: string, author: string): Promise<string | null> {
  // 1st attempt: title + author, German restricted
  try {
    const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=de${apiKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const item = data.items?.find((i: any) => i.volumeInfo?.imageLinks?.thumbnail);
    if (item) {
      return item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
    }
  } catch (_) {}

  // 2nd attempt: title only, German restricted
  try {
    const query = encodeURIComponent(`intitle:${title}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=de${apiKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const item = data.items?.find((i: any) => i.volumeInfo?.imageLinks?.thumbnail);
    if (item) {
      return item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
    }
  } catch (_) {}

  // 3rd attempt: title only, no language restriction (sometimes German books aren't tagged properly)
  try {
    const query = encodeURIComponent(`intitle:${title}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}${apiKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const item = data.items?.find((i: any) => i.volumeInfo?.imageLinks?.thumbnail);
    if (item) {
      return item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
    }
  } catch (_) {}

  return null;
}

async function main() {
  console.log('🇩🇪 Fixing the 33 German books with English covers...\n');

  // Get all German books with their original English title
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true, coverImage: true }
  });

  // Get all English book covers for comparison
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, coverImage: true }
  });
  const enCoversMap = new Map<string, string | null>();
  for (const b of enBooks) enCoversMap.set(b.title, b.coverImage);

  // Filter to only the books that need updating
  const needUpdate = deBooks.filter(b => {
    if (!b.coverImage || b.coverImage === '') return true;
    if (b.originalTitle) {
      const enCover = enCoversMap.get(b.originalTitle);
      if (enCover !== undefined && enCover === b.coverImage) return true;
    }
    return false;
  });

  console.log(`📋 Found ${needUpdate.length} books needing a real German cover.\n`);

  let updated = 0;
  let failed = 0;

  for (const book of needUpdate) {
    process.stdout.write(`⏳ "${book.title}" ... `);
    const coverUrl = await fetchCover(book.title, book.author);

    if (coverUrl && coverUrl !== book.coverImage) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: coverUrl }
      });
      console.log(`✅ Updated!`);
      updated++;
    } else if (coverUrl && coverUrl === book.coverImage) {
      console.log(`⏭️  Already set (same URL).`);
    } else {
      console.log(`❌ No cover found.`);
      failed++;
    }

    // Respect Google Books rate limit
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log(`\n✨ Done! Updated ${updated}/${needUpdate.length} covers.`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} books had no German cover found in Google Books API.`);
    console.log(`   These will continue to use the SVG fallback cover.`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
