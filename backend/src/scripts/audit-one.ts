import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function tryParseJSON(str: any): any[] {
  if (Array.isArray(str)) return str;
  if (typeof str === 'object' && str !== null) return Array.isArray(str) ? str : [];
  if (typeof str === 'string') {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

function countWords(str: any): number {
  if (typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

async function main() {
  const books = await prisma.book.findMany({ where: { language: 'en' }, select: { title: true, summary: true, chapters: true, keyInsights: true, actionItems: true, quotes: true } });
  
  let totalPremium = 0;
  for (const book of books) {
    let count = countWords(book.summary);
    
    // chapters
    const chs = tryParseJSON(book.chapters);
    chs.forEach((c: any) => {
      count += countWords(c.title);
      count += countWords(c.summary);
      count += countWords(c.keyTakeaway);
    });
    
    // keyInsights
    const kis = tryParseJSON(book.keyInsights);
    kis.forEach((ki: any) => {
      count += countWords(ki.title);
      count += countWords(ki.description);
      count += countWords(ki.explanation);
      count += countWords(ki.example);
      count += countWords(ki.impact);
    });

    // actionItems
    const ais = tryParseJSON(book.actionItems);
    ais.forEach((ai: any) => {
      if (typeof ai === 'string') count += countWords(ai);
      else { count += countWords(ai?.action); count += countWords(ai?.outcome); }
    });

    // quotes
    const qs = tryParseJSON(book.quotes);
    qs.forEach((q: any) => {
      if (typeof q === 'string') count += countWords(q);
      else { count += countWords(q?.quote); count += countWords(q?.context); count += countWords(q?.significance); }
    });

    if (count < 1500) {
      console.log(`[SHORT] ${book.title}: ${count} words`);
    } else {
      totalPremium++;
    }
  }
  console.log(`\nPREMIUM BOOKS: ${totalPremium} / ${books.length}`);
}

main().finally(() => prisma.$disconnect());
