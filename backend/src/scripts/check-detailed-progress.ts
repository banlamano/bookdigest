import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHORT_BOOK_TITLES = [
  'How to Win at the Sport of Business',
  'The Bogleheads\' Guide to Investing',
  'The Man Who Mistook His Wife for a Hat',
  'True Refuge',
  'The Small Big',
  'The Power of Moments',
  'The Buddha and the Badass',
  'Grit',
  'Redirect',
  'The Monk Who Sold His Ferrari',
  'Perennial Seller',
  'Company of One',
  'Powerful'
];

function countWords(str: string | null | undefined): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

async function checkDetailedProgress() {
  console.log('| Title | Language | Summary | Insights | Chapters | Total | Status |');
  console.log('|-------|----------|---------|----------|----------|-------|--------|');
  
  for (const title of SHORT_BOOK_TITLES) {
    for (const language of ['en' as const, 'de' as const]) {
      const book = await prisma.book.findFirst({
        where: {
          OR: [
            { title, language },
            { originalTitle: title, language }
          ]
        }
      });
      
      if (!book) {
        console.log(`| ${title} | ${language} | - | - | - | - | Missing |`);
        continue;
      }
      
      const summaryLength = countWords(book.summary);
      
      let insightsLength = 0;
      try {
        const insights = JSON.parse(book.keyInsights || '[]');
        insights.forEach((i: any) => { insightsLength += countWords(i.description); });
      } catch(e) {}

      let chaptersLength = 0;
      try {
        const chapters = JSON.parse(book.chapters || '[]');
        chapters.forEach((c: any) => { chaptersLength += countWords(c.summary); });
      } catch(e) {}

      const total = summaryLength + insightsLength + chaptersLength;
      
      // Target is 2000+ words for "Premium"
      const status = total >= 2000 ? '✅ Premium' : total >= 1500 ? '🟡 Good' : '❌ Short';
      
      console.log(`| ${title} | ${language} | ${summaryLength} | ${insightsLength} | ${chaptersLength} | ${total} | ${status} |`);
    }
  }
  
  process.exit(0);
}

checkDetailedProgress().catch(e => { console.error(e); process.exit(1); });
