
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { 
      OR: [
        { title: { contains: "Giver" } },
        { originalTitle: { contains: "Giver" } }
      ]
    },
    select: { id: true, title: true, originalTitle: true, language: true }
  });
  console.log(JSON.stringify(books, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
