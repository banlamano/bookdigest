import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allBooks = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      language: true,
      summary: true,
      chapters: true
    }
  });

  let minWords = Infinity;
  let shortestBook = null;
  let booksWithoutChapters = 0;
  let noChaptersList: any[] = [];

  for (const book of allBooks) {
    const wordCount = (book.summary || '').trim() === '' ? 0 : (book.summary || '').trim().split(/\s+/).length;
    
    if (wordCount < minWords) {
      minWords = wordCount;
      shortestBook = book;
    }

    let hasChapters = false;
    if (book.chapters) {
      let chArray: any[] = [];
      if (typeof book.chapters === 'string') {
        try {
          chArray = JSON.parse(book.chapters);
        } catch (e) {}
      } else {
        chArray = book.chapters as any[];
      }
      
      // Check if it's an array and has at least one valid chapter
      if (Array.isArray(chArray) && chArray.length > 0) {
        hasChapters = true;
      }
    }

    if (!hasChapters) {
      booksWithoutChapters++;
      noChaptersList.push({ title: book.title, language: book.language });
    }
  }

  console.log(`\n📊 FINAL PROGRESS AUDIT`);
  console.log(`======================`);
  console.log(`Total Books Checked: ${allBooks.length}`);
  
  console.log(`\n📚 SHORTEST BOOK SUMMARY:`);
  if (shortestBook) {
    console.log(`Title: "${shortestBook.title}" (${shortestBook.language.toUpperCase()})`);
    console.log(`Word Count: ${minWords} words`);
  } else {
    console.log(`No books found in the database.`);
  }

  console.log(`\n⚠️ BOOKS WITHOUT CHAPTER SUMMARIES (OR EMPTY ARRAYS):`);
  console.log(`Count: ${booksWithoutChapters} out of ${allBooks.length}`);
  if (booksWithoutChapters > 0) {
    console.log(`List:`);
    noChaptersList.slice(0, 10).forEach(b => console.log(` - ${b.title} (${b.language.toUpperCase()})`));
    if (booksWithoutChapters > 10) console.log(`   ...and ${booksWithoutChapters - 10} more`);
  }
}

main().finally(() => prisma.$disconnect());
