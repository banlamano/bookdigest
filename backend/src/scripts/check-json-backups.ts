import * as fs from 'fs';
import * as path from 'path';

function analyzeJson(filename: string) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} not found.`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const books = Array.isArray(data) ? data : [data];
  
  console.log(`\nAnalyzing ${filename} (${books.length} books found):`);
  
  let totalWords = 0;
  let skipped = 0;
  
  for (const book of books) {
    if (!book.summary) {
      skipped++;
      continue;
    }
    
    // Count total words in summary + insights + chapters + quotes + action items
    let wordCount = book.summary.split(/\s+/).length;
    
    if (Array.isArray(book.keyInsights)) {
        for (const ki of book.keyInsights) {
           wordCount += (ki.explanation || ki.description || '').split(/\s+/).length;
        }
    }
    
    if (Array.isArray(book.chapters)) {
        for (const ch of book.chapters) {
           wordCount += (ch.summary || '').split(/\s+/).length;
        }
    }
    
    totalWords += wordCount;
    if (books.indexOf(book) < 5) {
      console.log(`  - ${book.title}: ${wordCount} words total`);
    }
  }
  console.log(`  ... and ${books.length - Math.min(5, books.length)} more.`);
  if (books.length > 0) {
    console.log(`  Average words per book: ${Math.round(totalWords / (books.length - skipped))}`);
  }
}

analyzeJson('enBook.json');
analyzeJson('deBook.json');
