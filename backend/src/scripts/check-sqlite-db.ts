import Database from 'better-sqlite3';

function checkDatabase(dbPath: string) {
  try {
    const db = new Database(dbPath, { readonly: true });
    
    // Check if Book table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Book'").all();
    if (tables.length === 0) {
      console.log(`${dbPath}: No Book table found.`);
      return;
    }
    
    const countRow: any = db.prepare("SELECT COUNT(*) as count FROM Book").get();
    console.log(`\n--- Checking ${dbPath} (${countRow.count} books) ---`);
    
    const books: any[] = db.prepare("SELECT id, title, language, summary, keyInsights, chapters, actionItems, quotes FROM Book").all();
    let longBooks = 0;
    
    for (const book of books) {
      let wordCount = (book.summary || '').split(/\s+/).length;
      
      try {
        const ki = JSON.parse(book.keyInsights || '[]');
        if (Array.isArray(ki)) {
           for (const item of ki) wordCount += (item.explanation || item.description || '').split(/\s+/).length;
        }
      } catch(e) {}
      
      try {
        const ch = JSON.parse(book.chapters || '[]');
        if (Array.isArray(ch)) {
           for (const item of ch) wordCount += (item.summary || '').split(/\s+/).length;
        }
      } catch(e) {}
      
      if (wordCount >= 1000) {
        longBooks++;
        if (longBooks <= 5) {
          console.log(`  [HIGH WORDCOUNT] ${book.title} (${book.language}): ~${wordCount} words`);
        }
      } else if (longBooks === 0 && books.indexOf(book) < 3) {
        console.log(`  [SAMPLE] ${book.title} (${book.language}): ~${wordCount} words`);
      }
    }
    
    console.log(`  => Total books with >= 1000 words: ${longBooks}`);
    db.close();
  } catch(e: any) {
    console.log(`${dbPath}: Error reading DB - ${e.message}`);
  }
}

checkDatabase('prisma/dev.db');
checkDatabase('prisma/dev.db.backup');
checkDatabase('prisma/dev.db.final-restore-20260204-012212');
checkDatabase('prisma/dev.db.restore-point-20260203-201157');
