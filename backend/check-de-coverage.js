require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const total = await prisma.book.count({ where: { language: 'de' } });
  const aiCovers = await prisma.book.count({ where: { language: 'de', coverImage: { startsWith: '/ai-covers' } } });
  const googleCovers = await prisma.book.count({ where: { language: 'de', coverImage: { startsWith: 'https://books.google.com' } } });
  const otherHttps = await prisma.book.count({ where: { language: 'de', coverImage: { startsWith: 'https://' }, NOT: { coverImage: { startsWith: 'https://books.google.com' } } } });
  const emptyCover = await prisma.book.count({ where: { language: 'de', coverImage: '' } });
  const placeholder = await prisma.book.count({ where: { language: 'de', coverImage: { contains: 'placeholder' } } });

  console.log('=== German Books Cover Status ===');
  console.log('Total DE books:        ', total);
  console.log('AI-generated covers:   ', aiCovers);
  console.log('Google Books covers:   ', googleCovers);
  console.log('Other https covers:    ', otherHttps);
  console.log('Empty covers:          ', emptyCover);
  console.log('Placeholder covers:    ', placeholder);
  console.log('Accounted for:         ', aiCovers + googleCovers + otherHttps + emptyCover);

  if (emptyCover > 0 || placeholder > 0) {
    const bad = await prisma.book.findMany({
      where: { language: 'de', OR: [{ coverImage: '' }, { coverImage: { contains: 'placeholder' } }] },
      select: { id: true, title: true, coverImage: true }
    });
    console.log('\n=== Books with missing/placeholder covers ===');
    bad.forEach(b => console.log(`- [${b.title}] -> ${b.coverImage}`));
  } else {
    console.log('\nAll German books have valid covers.');
  }

  await prisma.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
