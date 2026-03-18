import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allEnBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { id: true, title: true, summary: true }
  });

  console.log(`Checking 10 random "English" books...\n`);
  
  for (let i = 0; i < 10; i++) {
    const randomIdx = Math.floor(Math.random() * allEnBooks.length);
    const book = allEnBooks[randomIdx];
    const preview = book.summary ? book.summary.substring(0, 150) + '...' : '(empty)';
    
    console.log(`Title: ${book.title}`);
    console.log(`Summary Preview: ${preview}\n`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
