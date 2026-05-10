import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnglishBooksLanguage() {
  const books = await prisma.book.findMany({
    where: { language: 'en' }
  });

  let englishCount = 0;
  let germanCount = 0;
  let emptyCount = 0;

  for (const book of books) {
    if (!book.summary) {
        emptyCount++;
        continue;
    }
    const s = book.summary.toLowerCase();
    const isEn = s.includes(' the ') || s.includes(' and ') || s.includes(' is ');
    const isDe = s.includes(' der ') || s.includes(' und ') || s.includes(' ist ') || s.includes(' das ');
    
    // Simplistic check
    if (isEn && !isDe) {
        englishCount++;
    } else if (isDe && !isEn) {
        germanCount++;
    } else {
        // Mixed or other?
        const enWords = (s.match(/\b(the|and|is)\b/g) || []).length;
        const deWords = (s.match(/\b(der|die|das|ist|und)\b/g) || []).length;
        if (enWords > deWords) englishCount++;
        else germanCount++;
    }
  }

  console.log(`Total English books: ${books.length}`);
  console.log(`English summaries: ${englishCount}`);
  console.log(`German summaries: ${germanCount}`);
  console.log(`Empty/No summaries: ${emptyCount}`);

  process.exit(0);
}

checkEnglishBooksLanguage().catch(e => { console.error(e); process.exit(1); });
