require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBook() {
  const books = await prisma.book.findMany({
    where: { title: { contains: 'Financial Freedom' }, language: 'de' },
  });
  console.log(JSON.stringify(books, null, 2));
  await prisma.$disconnect();
}
checkBook();
