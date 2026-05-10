import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, language: true, chapters: true }
  });

  const shortChaptersList: any[] = [];
  let totalChaptersChecked = 0;

  for (const book of books) {
    if (!book.chapters) continue;
    
    let chArray: any[] = [];
    if (typeof book.chapters === 'string') {
      try {
        chArray = JSON.parse(book.chapters);
      } catch (e) {
        continue;
      }
    } else {
      chArray = book.chapters as any[];
    }
    
    if (Array.isArray(chArray) && chArray.length > 0) {
      let totalWordsInChapters = 0;
      let veryShortChaptersCount = 0;

      for (const ch of chArray) {
        if (ch && ch.summary) {
          const wordCount = ch.summary.trim().split(/\s+/).length;
          totalWordsInChapters += wordCount;
          if (wordCount < 40) { // arbitrary threshold for "a paragraph or two" - let's say less than 40 words is very short
            veryShortChaptersCount++;
          }
        }
      }
      
      const avgWordsPerChapter = totalWordsInChapters / chArray.length;
      totalChaptersChecked += chArray.length;

      // Let's flag books where the average chapter summary is less than 50 words
      if (avgWordsPerChapter < 50) {
        shortChaptersList.push({
          id: book.id,
          title: book.title,
          language: book.language,
          avgWordsPerChapter: Math.round(avgWordsPerChapter),
          totalChapters: chArray.length,
          veryShortChapters: veryShortChaptersCount
        });
      }
    }
  }

  // Sort by average chapter word count (ascending)
  shortChaptersList.sort((a, b) => a.avgWordsPerChapter - b.avgWordsPerChapter);

  fs.writeFileSync(
    path.resolve(process.cwd(), 'short-chapters-report.json'),
    JSON.stringify({ 
      totalBooksWithShortChapters: shortChaptersList.length, 
      totalChaptersChecked,
      books: shortChaptersList 
    }, null, 2),
    'utf-8'
  );
  
  console.log(`Checked ${totalChaptersChecked} total chapters across all books.`);
  console.log(`Found ${shortChaptersList.length} books with very short chapter summaries (avg < 50 words per chapter).`);
}

main().finally(() => prisma.$disconnect());
