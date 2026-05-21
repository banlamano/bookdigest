import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing English covers from German books (SVG fallback will display instead)...\n');

  // Get all German books
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, coverImage: true }
  });

  // Get all English book covers
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, coverImage: true }
  });
  const enCoversMap = new Map<string, string | null>();
  for (const b of enBooks) enCoversMap.set(b.title, b.coverImage);

  // Find books still using English covers
  const toNull = deBooks.filter(b => {
    if (!b.coverImage || b.coverImage === '') return false;
    if (b.originalTitle) {
      const enCover = enCoversMap.get(b.originalTitle);
      if (enCover !== undefined && enCover === b.coverImage) return true;
    }
    return false;
  });

  console.log(`📋 Found ${toNull.length} German books still using English covers.\n`);

  let cleared = 0;
  for (const book of toNull) {
    await prisma.book.update({
      where: { id: book.id },
      data: { coverImage: '' }
    });
    console.log(`🗑️  Cleared: "${book.title}"`);
    cleared++;
  }

  console.log(`\n✨ Done! Cleared ${cleared} English covers from German books.`);
  console.log(`   These will now display the styled AI-generated SVG cover as fallback.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
