const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const deAi = await prisma.book.count({ where: { language: 'de', coverImage: { startsWith: '/ai-covers' } } });
  console.log('DE AI covers:', deAi);
  const enAi = await prisma.book.count({ where: { language: 'en', coverImage: { startsWith: '/ai-covers' } } });
  console.log('EN AI covers:', enAi);
  await prisma.$disconnect();
}
run();
