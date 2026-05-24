require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCovers() {
  console.log('🔧 Fixing ALL AI covers back to OpenLibrary...\n');

  // Get all books that currently have AI covers
  const books = await prisma.book.findMany({
    select: { id: true, title: true, isbn: true, coverImage: true, language: true }
  });

  const aiBooks = books.filter(b => b.coverImage && b.coverImage.startsWith('/ai-covers/'));
  console.log(`Found ${aiBooks.length} books with AI covers to fix.\n`);

  // The 18 books that SHOULD keep AI covers (from update-production-covers.js / update-covers.sql)
  const keepAiCovers = new Set([
    '74b0d5dc-6350-4b6e-9f44-39a66ff0c360',
    '9abe3264-bb5c-4102-840c-8c1c21d2bf50',
    'b9066e33-441c-4efc-b0f8-4ed1a1332ea5',
    'ce14c6a7-6f8d-4d37-94d3-ca941942aa92',
    '641592d1-cf3a-4bea-ae4b-88ae283b40d5',
    '69611b75-ac8c-4a74-991c-946cde526044',
    '0365165a-d499-4b47-9573-255c1dbe4ef4',
    '49b84f81-5286-4cc1-85fd-7302f20bfd9b',
    '74826407-8576-435c-bf77-80f497139c38',
    '6295da35-0ecb-4f2c-82c7-921ed0ed428b',
    '89caadae-e349-4ecf-96c1-1046c832023d',
    '295f79b1-15bf-4ddb-88ff-bd804c497832',
    '0955331c-c786-4bad-8d73-2ab939c9a23d',
    '6cbb6b83-d106-413d-95f9-d5284a657726',
    '3d9478ab-9967-4311-a2d4-039dd0fcf02c',
    'e6156973-00f0-4a0a-be4e-086c3a58b577',
    'c1eb086f-b794-4a47-825a-a182ae2f3bb6',
    'd70edb81-256b-43e2-9b70-7ab9bed02645',
  ]);

  let fixed = 0;
  let skipped = 0;
  let noIsbn = 0;

  for (const book of aiBooks) {
    // Skip the 18 that should keep AI covers
    if (keepAiCovers.has(book.id)) {
      console.log(`⏭️  KEEP AI: ${book.title}`);
      skipped++;
      continue;
    }

    if (!book.isbn) {
      console.log(`⚠️  NO ISBN: ${book.title} - cannot restore`);
      noIsbn++;
      continue;
    }

    const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    
    await prisma.book.update({
      where: { id: book.id },
      data: { coverImage: openLibraryUrl }
    });

    fixed++;
    if (fixed % 50 === 0) {
      console.log(`  ... fixed ${fixed} books so far`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 FIX SUMMARY:');
  console.log(`   Total AI covers found: ${aiBooks.length}`);
  console.log(`   Fixed to OpenLibrary: ${fixed}`);
  console.log(`   Kept as AI covers: ${skipped}`);
  console.log(`   No ISBN (need manual fix): ${noIsbn}`);
  console.log('='.repeat(60));

  // Verify final state
  const finalBooks = await prisma.book.findMany({ select: { coverImage: true } });
  let finalAi = 0, finalOl = 0;
  for (const b of finalBooks) {
    if (b.coverImage?.startsWith('/ai-covers/')) finalAi++;
    else if (b.coverImage?.includes('openlibrary.org')) finalOl++;
  }
  console.log(`\n✅ FINAL STATE: ${finalOl} OpenLibrary, ${finalAi} AI covers, ${finalBooks.length} total`);

  await prisma.$disconnect();
}

fixCovers().catch(console.error);
