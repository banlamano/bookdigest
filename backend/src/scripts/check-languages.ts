import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const languages = await prisma.book.groupBy({
    by: ['language'],
    _count: {
      id: true
    }
  });
  console.log('Languages in database:', languages);
  
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true },
    take: 5
  });
  console.log('Sample German books:', deBooks);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
