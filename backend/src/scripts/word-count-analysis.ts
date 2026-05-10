import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function countWords(str: string | null | undefined): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

function countWordsInJson(json: any): number {
  if (!json) return 0;
  if (Array.isArray(json)) {
    return json.reduce((sum, item) => sum + countWordsInJson(item), 0);
  }
  if (typeof json === 'object') {
    return Object.values(json).reduce((sum, value) => {
      if (typeof value === 'string') return sum + countWords(value);
      if (typeof value === 'object') return sum + countWordsInJson(value);
      return sum;
    }, 0);
  }
  if (typeof json === 'string') return countWords(json);
  return 0;
}

async function main() {
  console.log('📊 Word Count Analytics Report\n');

  // Only check English versions to avoid overcounting (EN vs DE)
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { 
      title: true, 
      summary: true, 
      keyInsights: true, 
      chapters: true, 
      quotes: true, 
      actionItems: true 
    }
  });

  const stats = {
    below300: 0,
    below1000: 0,
    below2000: 0,
    above2500: 0,
    above3000: 0,
    total: books.length
  };

  const wordCounts: number[] = [];

  for (const book of books) {
    let totalWords = 0;
    
    totalWords += countWords(book.summary);
    totalWords += countWordsInJson(book.keyInsights);
    totalWords += countWordsInJson(book.chapters);
    totalWords += countWordsInJson(book.quotes);
    totalWords += countWordsInJson(book.actionItems);

    wordCounts.push(totalWords);

    if (totalWords < 300) stats.below300++;
    if (totalWords < 1000) stats.below1000++;
    if (totalWords < 2000) stats.below2000++;
    if (totalWords >= 2500) stats.above2500++;
    if (totalWords >= 3000) stats.above3000++;
  }

  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const maxWords = Math.max(...wordCounts);
  const minWords = Math.min(...wordCounts);

  console.log('--- Word Count Buckets ---');
  console.log(`Below 300 words:  ${stats.below300}`);
  console.log(`Below 1000 words: ${stats.below1000}`);
  console.log(`Below 2000 words: ${stats.below2000}`);
  console.log(`2500 words or more: ${stats.above2500}`);
  console.log(`3000 words or more: ${stats.above3000}`);
  console.log('');
  console.log('--- Averages ---');
  console.log(`Average words: ${avgWords}`);
  console.log(`Max words:     ${maxWords}`);
  console.log(`Min words:     ${minWords}`);
  console.log(`Total sampled: ${stats.total}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
