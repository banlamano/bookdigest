const { PrismaClient } = require('@prisma/client');
const { generateAllAffiliateLinks } = require('./src/utils/affiliateLinks');

const prisma = new PrismaClient();

async function regenerateAllLinks() {
  console.log('🔧 Regenerating ALL affiliate links with fixed format...\n');
  
  const books = await prisma.book.findMany({
    select: { id: true, title: true, author: true, isbn: true }
  });
  
  console.log(`Found ${books.length} books\n`);
  
  let updated = 0;
  
  for (const book of books) {
    const links = generateAllAffiliateLinks(book.title, book.author, book.isbn || undefined);
    
    await prisma.book.update({
      where: { id: book.id },
      data: {
        amazonLinkUS: links.US,
        amazonLinkUK: links.UK,
        amazonLinkDE: links.DE,
        amazonLinkES: links.ES,
        amazonLinkFR: links.FR,
        amazonLinkIT: links.IT,
        amazonLink: links.US,
      }
    });
    
    updated++;
    
    if (updated % 50 === 0) {
      console.log(`Updated ${updated}/${books.length}...`);
    }
  }
  
  console.log(`\n✅ Successfully regenerated ${updated} books with fixed links!`);
  
  // Test a few
  const testBooks = await prisma.book.findMany({
    take: 3,
    select: { title: true, amazonLinkUS: true }
  });
  
  console.log('\n📋 Sample new links:');
  testBooks.forEach(book => {
    console.log(`${book.title}: ${book.amazonLinkUS.substring(0, 80)}...`);
  });
  
  await prisma.$disconnect();
}

regenerateAllLinks();
