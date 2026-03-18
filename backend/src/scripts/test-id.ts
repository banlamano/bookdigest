import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const deBook = await prisma.book.findFirst({ where: { language: 'de', originalTitle: { not: null } }, select: { id: true, title: true, originalTitle: true } });
  if (deBook) {
    const enBook = await prisma.book.findFirst({ where: { language: 'en', title: deBook.originalTitle }, select: { id: true, title: true } });
    console.log('EN:', enBook);
    console.log('DE:', deBook);
  }
}
main().finally(() => prisma.$disconnect()); ^^^^^^^^^^^^^^^^^^ 51356717k