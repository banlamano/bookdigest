// Bulk upload covers from CSV file
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const mappings = [];
  for (const line of dataLines) {
    // Simple CSV parser (handles quoted fields)
    const match = line.match(/^(\d+),(.+)$/);
    if (match) {
      const bookId = parseInt(match[1]);
      let coverUrl = match[2].trim();
      
      // Remove quotes if present
      if (coverUrl.startsWith('"') && coverUrl.endsWith('"')) {
        coverUrl = coverUrl.slice(1, -1);
      }
      
      mappings.push({ bookId, coverUrl });
    }
  }
  
  return mappings;
}

async function bulkUploadCovers(csvFile) {
  if (!csvFile) {
    console.log('❌ Usage: node upload-custom-covers.js <csv-file>');
    console.log('\nCSV Format:');
    console.log('  book_id,cover_url');
    console.log('  1,https://example.com/cover1.jpg');
    console.log('  2,https://example.com/cover2.jpg');
    console.log('\nOR create covers-mapping.csv and run:');
    console.log('  node upload-custom-covers.js covers-mapping.csv\n');
    process.exit(1);
  }

  if (!fs.existsSync(csvFile)) {
    console.log(`❌ File not found: ${csvFile}\n`);
    process.exit(1);
  }

  console.log('📊 Bulk Cover Upload\n');
  console.log(`Reading from: ${csvFile}\n`);

  const mappings = parseCSV(csvFile);
  
  console.log(`Found ${mappings.length} cover mappings\n`);

  let updated = 0;
  let failed = 0;
  const errors = [];

  for (const { bookId, coverUrl } of mappings) {
    try {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { id: true, title: true, author: true }
      });

      if (!book) {
        console.log(`❌ [${bookId}] Book not found`);
        failed++;
        errors.push({ bookId, error: 'Book not found' });
        continue;
      }

      await prisma.book.update({
        where: { id: bookId },
        data: { coverImage: coverUrl }
      });

      console.log(`✅ [${bookId}] ${book.title} - Updated`);
      updated++;
      
    } catch (error) {
      console.log(`❌ [${bookId}] Error: ${error.message}`);
      failed++;
      errors.push({ bookId, error: error.message });
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESULTS:');
  console.log('═══════════════════════════════════════');
  console.log(`Total: ${mappings.length}`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('═══════════════════════════════════════\n');

  if (errors.length > 0) {
    console.log('Failed updates:');
    errors.forEach(({ bookId, error }) => {
      console.log(`  - Book ${bookId}: ${error}`);
    });
    console.log('');
  }

  await prisma.$disconnect();
}

const csvFile = process.argv[2];
bulkUploadCovers(csvFile);
