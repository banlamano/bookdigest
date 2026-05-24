require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, coverImage: true },
    take: 10
  });
  console.log("German books:");
  books.forEach(b => console.log(`[${b.title}] -> ${b.coverImage}`));
  await prisma.$disconnect();
}
check();
