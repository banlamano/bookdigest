import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allBooks = await prisma.book.findMany();

  const enBooks = allBooks.filter(b => b.language === 'en');
  const deBooks = allBooks.filter(b => b.language === 'de');

  function analyze(books: any[], label: string) {
    let premium = 0, good = 0, short = 0, veryShort = 0, empty = 0;
    let totalInsights = 0, totalChapters = 0, totalQuotes = 0, totalActions = 0;
    const shortList: any[] = [];

    for (const b of books) {
      const words = (b.summary || '').split(/\s+/).length;
      const ki = typeof b.keyInsights === 'string' ? JSON.parse(b.keyInsights || '[]') : (b.keyInsights || []);
      const ch = typeof b.chapters === 'string' ? JSON.parse(b.chapters || '[]') : (b.chapters || []);
      const q = typeof b.quotes === 'string' ? JSON.parse(b.quotes || '[]') : (b.quotes || []);
      const a = typeof b.actionItems === 'string' ? JSON.parse(b.actionItems || '[]') : (b.actionItems || []);

      const insightCount = Array.isArray(ki) ? ki.length : 0;
      const chapterCount = Array.isArray(ch) ? ch.length : 0;
      const quoteCount = Array.isArray(q) ? q.length : 0;
      const actionCount = Array.isArray(a) ? a.length : 0;

      totalInsights += insightCount;
      totalChapters += chapterCount;
      totalQuotes += quoteCount;
      totalActions += actionCount;

      if (words >= 600) premium++;
      else if (words >= 400) good++;
      else if (words >= 200) { short++; shortList.push({ title: b.title, words, insights: insightCount, chapters: chapterCount }); }
      else if (words > 10) { veryShort++; shortList.push({ title: b.title, words, insights: insightCount, chapters: chapterCount }); }
      else { empty++; shortList.push({ title: b.title, words: 0, insights: 0, chapters: 0 }); }
    }

    return {
      label,
      total: books.length,
      premium,
      good,
      short,
      veryShort,
      empty,
      avgInsights: (totalInsights / books.length).toFixed(1),
      avgChapters: (totalChapters / books.length).toFixed(1),
      avgQuotes: (totalQuotes / books.length).toFixed(1),
      avgActions: (totalActions / books.length).toFixed(1),
      shortList: shortList.sort((a, b) => a.words - b.words)
    };
  }

  const enStats = analyze(enBooks, 'English (EN)');
  const deStats = analyze(deBooks, 'German (DE)');

  const report = {
    totalBooks: allBooks.length,
    english: enStats,
    german: deStats
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), 'full-report.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );
  console.log('Report saved to full-report.json');
}

main().finally(() => prisma.$disconnect());
