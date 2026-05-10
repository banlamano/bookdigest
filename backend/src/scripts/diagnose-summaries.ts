import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get distribution of summary word counts
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 20
  });

  console.log('Most recently updated English books:');
  console.log('='.repeat(80));
  for (const b of books) {
    const wc = (b.summary || '').split(/\s+/).length;
    console.log(`  [${wc}w] ${b.title}`);
    console.log(`         Created: ${b.createdAt.toISOString()}`);
    console.log(`         Updated: ${b.updatedAt.toISOString()}`);
  }

  // Check word count distribution
  const allBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { summary: true }
  });

  const ranges = { '0-200': 0, '200-400': 0, '400-600': 0, '600-800': 0, '800-1000': 0, '1000+': 0 };
  for (const b of allBooks) {
    const wc = (b.summary || '').split(/\s+/).length;
    if (wc < 200) ranges['0-200']++;
    else if (wc < 400) ranges['200-400']++;
    else if (wc < 600) ranges['400-600']++;
    else if (wc < 800) ranges['600-800']++;
    else if (wc < 1000) ranges['800-1000']++;
    else ranges['1000+']++;
  }

  console.log('\n\nWord count distribution (EN):');
  console.log('='.repeat(40));
  for (const [range, count] of Object.entries(ranges)) {
    console.log(`  ${range.padEnd(10)}: ${count} books`);
  }

  // Check if summaries contain fallback template text
  let fallbackCount = 0;
  for (const b of allBooks) {
    if (b.summary?.includes('transformative guide that challenges conventional thinking') ||
        b.summary?.includes('challenges conventional thinking') ||
        b.summary?.includes('distills complex concepts into practical wisdom')) {
      fallbackCount++;
    }
  }
  console.log(`\nBooks with FALLBACK/TEMPLATE summaries: ${fallbackCount}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
