import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common German words that should NOT appear in English summaries
const germanIndicators = [
  'und', 'die', 'der', 'das', 'ist', 'ein', 'eine', 'für', 'mit', 'auf',
  'nicht', 'sich', 'dass', 'auch', 'wie', 'aber', 'oder', 'werden', 'können',
  'dieser', 'wenn', 'durch', 'Menschen', 'Leben', 'Buch', 'Autor'
];

function countGermanWords(text: string): number {
  const words = text.split(/\s+/);
  let count = 0;
  for (const w of words) {
    const clean = w.replace(/[.,;:!?"'()]/g, '').toLowerCase();
    // Only count uniquely German words (exclude English-German overlaps like 'und' could be noise)
    if (['für', 'und', 'können', 'Menschen', 'dieser', 'dass', 'nicht', 'werden', 'Buch', 'Autor', 'Kapitel', 'Erklärung', 'Beispiel', 'Auswirkung', 'Zusammenfassung'].map(w=>w.toLowerCase()).includes(clean)) {
      count++;
    }
  }
  return count;
}

async function main() {
  const books = await prisma.book.findMany({ where: { language: 'en' } });
  
  const affected: any[] = [];

  for (const book of books) {
    const allText = [
      book.summary || '',
      JSON.stringify(book.keyInsights || ''),
      JSON.stringify(book.chapters || ''),
    ].join(' ');

    const germanCount = countGermanWords(allText);
    const totalWords = allText.split(/\s+/).length;
    const germanPct = (germanCount / totalWords) * 100;

    if (germanCount > 5) {
      affected.push({
        id: book.id,
        title: book.title,
        germanWordCount: germanCount,
        totalWords,
        germanPct: germanPct.toFixed(1) + '%',
        sample: book.summary?.substring(0, 200)
      });
    }
  }

  affected.sort((a, b) => b.germanWordCount - a.germanWordCount);

  fs.writeFileSync(
    path.resolve(process.cwd(), 'german-in-english.json'),
    JSON.stringify({ count: affected.length, books: affected.slice(0, 30) }, null, 2),
    'utf-8'
  );
  console.log(`Found ${affected.length} English books with significant German content`);
}

main().finally(() => prisma.$disconnect());
