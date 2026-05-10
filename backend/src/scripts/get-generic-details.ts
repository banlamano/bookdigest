
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { summary: { contains: "transformatives Handbuch" } },
        { summary: { contains: "konventionelles Denken herausfordert" } },
        { summary: { contains: "destilliert komplexe Konzepte" } },
        { summary: { contains: "umsetzbare Einblicke" } },
        { summary: { contains: "self-help-Enthusiasten" } }
      ]
    },
    select: { id: true, title: true, language: true, originalTitle: true }
  });

  console.log(JSON.stringify(books, null, 2));
}

check().finally(() => prisma.$disconnect());
