import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const books = await prisma.book.findMany({
    where: { language: 'de', coverImage: { not: '' } },
    select: { title: true, coverImage: true },
    take: 10
  });
  console.log(books.map(b => b.coverImage));
}
run().finally(() => prisma.$disconnect());
