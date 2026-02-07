const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLinks() {
  const books = await prisma.book.findMany({
    take: 5,
    select: {
      title: true,
      author: true,
      isbn: true,
      amazonLinkUS: true,
      amazonLinkUK: true,
      amazonLinkDE: true
    }
  });

  console.log('🔍 Testing Amazon Affiliate Links\n');
  
  books.forEach((book, i) => {
    console.log(`${i + 1}. ${book.title} by ${book.author}`);
    console.log(`   ISBN: ${book.isbn || 'NONE'}`);
    console.log(`   US Link: ${book.amazonLinkUS}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

testLinks();
