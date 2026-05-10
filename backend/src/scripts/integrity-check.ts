import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DATA INTEGRITY REPORT ---');
  
  // 1. Total counts
  const totalBooks = await prisma.book.count();
  const enCount = await prisma.book.count({ where: { language: 'en' } });
  const deCount = await prisma.book.count({ where: { language: 'de' } });
  
  console.log(`Total Books: ${totalBooks}`);
  console.log(`English:     ${enCount}`);
  console.log(`German:      ${deCount}`);

  // 2. Duplicate Check
  const books = await prisma.book.findMany({ select: { title: true, language: true, author: true } });
  const counts = new Map();
  let duplicates = 0;
  
  for (const book of books) {
    const key = `${book.title}|${book.language}|${book.author}`;
    counts.set(key, (counts.get(key) || 0) + 1);
    if (counts.get(key) > 1) {
      duplicates++;
    }
  }
  console.log(`Duplicates:  ${duplicates} (should be 0)`);

  // 3. Language Content Check (Sample English for German text)
  const enSamples = await prisma.book.findMany({
    where: { language: 'en' },
    take: 50,
    select: { summary: true, title: true }
  });
  
  let suspectedGermanInEn = 0;
  const germanWords = ['der', 'die', 'das', 'und', 'ist', 'von', 'im', 'den'];
  
  for (const sample of enSamples) {
    if (!sample.summary) continue;
    const words = sample.summary.toLowerCase().split(/\s+/);
    const germanMatches = words.filter(w => germanWords.includes(w)).length;
    if (germanMatches > 5) {
      suspectedGermanInEn++;
    }
  }
  console.log(`Suspected German in English books: ${suspectedGermanInEn} / 50 sampled`);

  // 4. Admin Account Check
  const admin = await prisma.user.findFirst({ where: { email: 'admin@bookdigest.com', role: 'ADMIN' } });
  console.log(`Admin Account: ${admin ? '✅ OK' : '❌ MISSING'}`);
  
  console.log('-----------------------------');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
