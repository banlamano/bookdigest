import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true }
  });

  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { title: true, originalTitle: true }
  });

  const enTitles = new Set(enBooks.map(b => b.title));
  
  // A German book either has its original English title in originalTitle, or uses the same title
  const deTitles = new Set(deBooks.map(b => b.originalTitle || b.title));

  let translatedCount = 0;
  let missingCount = 0;
  
  for (const title of enTitles) {
    if (deTitles.has(title)) {
      translatedCount++;
    } else {
      missingCount++;
    }
  }

  const progressPct = ((translatedCount / enTitles.size) * 100).toFixed(1);

  console.log(`\n===========================================`);
  console.log(`🌍 TRANSLATION PROGRESS REPORT`);
  console.log(`===========================================`);
  console.log(`Total English books:   ${enTitles.size}`);
  console.log(`Total German books:    ${deBooks.length}`);
  console.log(`-------------------------------------------`);
  console.log(`✅ Translated books:   ${translatedCount} (${progressPct}%)`);
  
  if (missingCount > 0) {
    console.log(`⏳ Pending translation: ${missingCount}`);
  } else {
    console.log(`🎉 Translation is 100% COMPLETE!`);
  }
  console.log(`===========================================\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
