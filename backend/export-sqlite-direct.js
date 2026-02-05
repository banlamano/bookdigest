const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

async function exportData() {
  console.log('\n🚀 Exporting Local Database to Production\n');
  console.log('─'.repeat(80));

  // Open local SQLite database
  const db = new sqlite3.Database('./prisma/dev.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('❌ Failed to open database:', err);
      process.exit(1);
    }
    console.log('✅ Connected to local SQLite database');
  });

  return new Promise((resolve, reject) => {
    // Get all books
    db.all('SELECT * FROM Book', [], async (err, books) => {
      if (err) {
        console.error('❌ Failed to query books:', err);
        reject(err);
        return;
      }

      console.log(`✅ Found ${books.length} books\n`);

      // Count AI-generated
      const aiGenerated = books.filter(b => 
        b.summary && b.summary.length > 800 && !b.summary.includes('transformative guide')
      ).length;

      console.log(`📊 Quality Check:`);
      console.log(`   Total: ${books.length}`);
      console.log(`   AI-generated: ${aiGenerated}`);
      console.log(`   Quality: ${((aiGenerated/books.length)*100).toFixed(1)}%\n`);

      console.log('📤 Updating production via API...\n');

      let updated = 0;
      let failed = 0;

      // Update in batches
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        try {
          const response = await fetch('https://bookdigest-lypx.onrender.com/api/admin/update-book', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: book.id,
              summary: book.summary,
              keyInsights: book.keyInsights,
              chapters: book.chapters,
              quotes: book.quotes,
              actionItems: book.actionItems
            })
          });

          if (response.ok) {
            updated++;
            if (updated % 25 === 0) {
              console.log(`   ✅ Updated ${updated}/${books.length} books...`);
            }
          } else {
            failed++;
            const errorText = await response.text();
            console.error(`   ❌ Failed: ${book.title} - ${response.status}: ${errorText}`);
          }

        } catch (error) {
          failed++;
          console.error(`   ❌ Failed: ${book.title} - ${error.message}`);
        }

        // Small delay to avoid overwhelming the server
        if (i % 10 === 0 && i > 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      console.log('\n' + '='.repeat(80));
      console.log('✅ EXPORT COMPLETE!');
      console.log('='.repeat(80));
      console.log(`Successfully updated: ${updated}/${books.length}`);
      console.log(`Failed: ${failed}`);
      console.log(`Success rate: ${((updated/books.length)*100).toFixed(1)}%`);
      console.log('='.repeat(80));

      db.close();
      resolve();
    });
  });
}

exportData()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
