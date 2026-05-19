import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { title: true, author: true, id: true, coverImage: true },
    take: 10
  });
  console.log(JSON.stringify(books, null, 2));
}

main().finally(() => prisma.$disconnect());
