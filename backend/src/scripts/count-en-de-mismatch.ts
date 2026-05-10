import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countGermanSummariesInEnglishBooks() {
  const books = await prisma.book.findMany({
    where: { language: 'en' }
  });

  const germanPatterns = [
    'von',
    'ist ein',
    'Das Buch',
    'bietet',
    'Einblicke'
  ];

  let germanCount = 0;
  let totalCount = books.length;

  for (const book of books) {
    if (!book.summary) continue;
    // Check if the summary contains multiple German indicators
    const isGerman = (book.summary.includes(' von ') && book.summary.includes(' ist ein ')) || 
                    (book.summary.includes(' das ') && book.summary.includes(' für '));
    
    // Specifically the template mentioned in the report:
    // "[Title] von [Author] ist ein transformatives Handbuch, das konventionelles Denken herausfordert und umsetzbare Einblicke für..."
    if (book.summary.includes('ist ein transformatives Handbuch')) {
        germanCount++;
    } else if (isGerman && !book.summary.includes(' the ') && !book.summary.includes(' and ')) {
        germanCount++;
    }
  }

  console.log(`Total English books: ${totalCount}`);
  console.log(`English books with German summaries (detected): ${germanCount}`);

  process.exit(0);
}

countGermanSummariesInEnglishBooks().catch(e => { console.error(e); process.exit(1); });
