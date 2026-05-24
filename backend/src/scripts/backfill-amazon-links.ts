import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { generateAffiliateLink } from '../utils/affiliateLinks';
import { toAmazonAsin } from '../utils/isbn';

const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes('--dry');
  console.log(`🔗 Backfilling Amazon /dp/ links${dryRun ? ' (DRY RUN)' : ''}\n`);

  // For German books → use amazon.de; for English → amazon.com
  // (Frontend will still let users pick a different region; we set sensible defaults.)
  const books = await prisma.book.findMany({
    select: { id: true, title: true, author: true, isbn: true, language: true, amazonLink: true },
  });

  let updated = 0;
  let skippedNoIsbn = 0;
  let skippedAlreadyDp = 0;
  let badIsbn = 0;

  for (const book of books) {
    if (!book.isbn) {
      skippedNoIsbn++;
      continue;
    }

    const asin = toAmazonAsin(book.isbn);
    if (!asin) {
      badIsbn++;
      continue;
    }

    if (book.amazonLink?.includes('/dp/')) {
      skippedAlreadyDp++;
      continue;
    }

    const region = book.language === 'de' ? 'DE' : 'US';
    const newLink = generateAffiliateLink(book.title, book.author, book.isbn, region);

    if (!dryRun) {
      await prisma.book.update({
        where: { id: book.id },
        data: { amazonLink: newLink },
      });
    }
    updated++;
    if (updated <= 5 || updated % 50 === 0) {
      console.log(`  [${updated}] ${book.title.substring(0, 50).padEnd(50)} → /dp/${asin}`);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Updated:           ${updated}`);
  console.log(`  Already /dp/:      ${skippedAlreadyDp}`);
  console.log(`  No ISBN (skipped): ${skippedNoIsbn}`);
  console.log(`  Bad/unparseable ISBN: ${badIsbn}`);
  console.log(`  Total books:       ${books.length}`);

  if (dryRun) console.log(`\n💡 Re-run without --dry to apply changes.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
