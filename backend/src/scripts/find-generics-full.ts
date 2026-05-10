
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
    select: { id: true, title: true, language: true }
  });

  console.log(`GENERIC REPLICATES FOUND: ${books.length}`);
  for (const b of books) {
    console.log(`  - [${b.language}] ${b.title}`);
  }
}

check().finally(() => prisma.$disconnect());
