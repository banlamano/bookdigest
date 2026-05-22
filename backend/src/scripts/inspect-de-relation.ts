import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true, isbn: true, coverImage: true },
    take: 20
  });
  console.log(JSON.stringify(deBooks, null, 2));
}

main().finally(() => prisma.$disconnect());
