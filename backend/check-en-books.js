const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const books = await prisma.book.findMany({
    where: {
      title: {
        in: ['After You', 'Still Me', 'Me Before You', 'The Rosie Result']
      }
    },
    select: { title: true, language: true, coverImage: true }
  });
  console.log(books);
  await prisma.$disconnect();
}

run().catch(console.error);
