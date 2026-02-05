const { PrismaClient } = require('@prisma/client');

// Two separate Prisma clients
const sqlite = require('sqlite3').verbose();
const { Client: PgClient } = require('pg');

async function exportData() {
  console.log('\n🚀 Exporting Local SQLite → Production PostgreSQL\n');
  console.log('─'.repeat(80));

  // Open SQLite database
  const db = new sqlite.Database('./prisma/dev.db', (err) => {
    if (err) {
      console.error('❌ Failed to open SQLite database:', err);
      process.exit(1);
    }
    console.log('✅ Connected to local SQLite database');
  });

  // Connect to PostgreSQL
  const pgClient = new PgClient({
    connectionString: 'postgresql://bookdigest_db_user:ORU4MsmTBBtSUAuZiDY01iMoIL7qrxC2@dpg-cu6i3g1u0jms73dudcfg-a.frankfurt-postgres.render.com/bookdigest_db?sslmode=require'
  });

  try {
    await pgClient.connect();
    console.log('✅ Connected to production PostgreSQL\n');

    // Get all books from SQLite
    const books = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Book', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📚 Found ${books.length} books in local database\n`);

    // Count AI-generated
    const aiGenerated = books.filter(b => 
      b.summary && b.summary.length > 800 && !b.summary.includes('transformative guide')
    ).length;

    console.log(`📊 Quality Check:`);
    console.log(`   Total: ${books.length}`);
    console.log(`   AI-generated: ${aiGenerated}`);
    console.log(`   Quality: ${((aiGenerated/books.length)*100).toFixed(1)}%\n`);

    // Update production
    console.log('📤 Updating production database...\n');

    let updated = 0;
    let failed = 0;

    for (const book of books) {
      try {
        await pgClient.query(
          `UPDATE "Book" SET 
            summary = $1, 
            "keyInsights" = $2, 
            chapters = $3, 
            quotes = $4, 
            "actionItems" = $5,
            "updatedAt" = NOW()
          WHERE id = $6`,
          [book.summary, book.keyInsights, book.chapters, book.quotes, book.actionItems, book.id]
        );

        updated++;
        if (updated % 50 === 0) {
          console.log(`   ✅ Updated ${updated}/${books.length} books...`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Failed: ${book.title} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ EXPORT COMPLETE!');
    console.log('='.repeat(80));
    console.log(`Successfully updated: ${updated}/${books.length}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((updated/books.length)*100).toFixed(1)}%`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Export failed:', error);
  } finally {
    db.close();
    await pgClient.end();
  }
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
