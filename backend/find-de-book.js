require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBook() {
  const title = 'Financial Freedom'; // original English title
  const books = await prisma.book.findMany({
    where: { language: 'de', originalTitle: title },
    select: { id: true, title: true, slug: true, author: true },
  });
  console.log('German books matching original title:', books);
  await prisma.$disconnect();
}
findBook();
