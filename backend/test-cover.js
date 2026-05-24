const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const b = await prisma.book.findFirst({ where: { title: 'After You' } });
  console.log(b.coverImage);
  await prisma.$disconnect();
}
main();
