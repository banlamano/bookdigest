import { PrismaClient } from '@prisma/client';
import { generateAllAffiliateLinks } from './src/utils/affiliateLinks';

const prisma = new PrismaClient();

async function addAffiliateLinksToAllBooks() {
  console.log('🔗 Adding Amazon affiliate links to all books...\n');

  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      isbn: true,
    },
  });

  console.log(`Found ${books.length} books\n`);

  let updated = 0;
  let skipped = 0;

  for (const book of books) {
    try {
      // Generate affiliate links for all 3 regions
      const affiliateLinks = generateAllAffiliateLinks(
        book.title,
        book.author,
        book.isbn || undefined
      );

      // Update the book with affiliate links
      await prisma.book.update({
        where: { id: book.id },
        data: {
          amazonLinkUS: affiliateLinks.US,
          amazonLinkUK: affiliateLinks.UK,
          amazonLinkDE: affiliateLinks.DE,
          amazonLink: affiliateLinks.US, // Default to US
        },
      });

      console.log(`✅ ${book.title}`);
      updated++;
    } catch (error) {
      console.error(`❌ Error updating ${book.title}:`, error);
      skipped++;
    }

    // Progress indicator
    if ((updated + skipped) % 50 === 0) {
      console.log(`\nProgress: ${updated + skipped}/${books.length}\n`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`❌ Skipped: ${skipped}`);
  console.log(`📚 Total: ${books.length}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

addAffiliateLinksToAllBooks().catch(console.error);
