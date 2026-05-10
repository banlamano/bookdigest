import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true },
    take: 10
  });

  for (const b of books) {
    const wc = b.summary?.split(/\s+/).length || 0;
    console.log('---');
    console.log(`${b.title} (${wc}w)`);
    console.log(b.summary?.substring(0, 400));
    console.log('');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
