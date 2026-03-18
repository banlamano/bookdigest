import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const deCount = await prisma.book.count({ where: { language: 'de' } });
  const enCount = await prisma.book.count({ where: { language: 'en' } });
  console.log(`German books: ${deCount} / ${enCount} English books`);
}
main().finally(() => prisma.$disconnect());
