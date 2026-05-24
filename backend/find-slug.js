const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const books = await prisma.book.findMany({
    where: { 
      OR: [
        { title: { contains: 'Minuten-Manager' } },
        { slug: { contains: 'minuten-manager' } }
      ]
    },
    select: { slug: true, title: true, language: true, originalTitle: true }
  });
  console.log('Books found:', books);
  await prisma.$disconnect();
}
run().catch(console.error);
