require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function revertCovers() {
  console.log('🔄 Reverting ALL book covers to their original state...\n');

  try {
    // 1. Reset all books to OpenLibrary covers based on their ISBN
    console.log('1. Resetting all books to OpenLibrary covers...');
    const books = await prisma.book.findMany();
    let resetCount = 0;
    
    for (const book of books) {
      if (book.isbn) {
        await prisma.book.update({
          where: { id: book.id },
          data: { coverImage: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` }
        });
        resetCount++;
      }
    }
    console.log(`✅ Reset ${resetCount} books to OpenLibrary covers.\n`);

    // 2. Apply Google Books updates from migration.sql
    console.log('2. Applying Google Books covers from migration.sql...');
    const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20260205_update_book_covers', 'migration.sql');
    if (fs.existsSync(migrationPath)) {
      const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
      const queries = sqlContent.split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--'));

      for (const query of queries) {
        // Execute raw query
        await prisma.$executeRawUnsafe(query);
      }
      console.log(`✅ Applied ${queries.length} Google Books overrides.\n`);
    } else {
      console.log('⚠️ migration.sql not found! Skipping Google Books updates.\n');
    }

    // 3. Apply AI Covers for the 18 books that had them originally
    console.log('3. Applying 18 original AI covers...');
    const updates = [
      { id: '74b0d5dc-6350-4b6e-9f44-39a66ff0c360', coverUrl: '/ai-covers/74b0d5dc-6350-4b6e-9f44-39a66ff0c360.svg' },
      { id: '9abe3264-bb5c-4102-840c-8c1c21d2bf50', coverUrl: '/ai-covers/9abe3264-bb5c-4102-840c-8c1c21d2bf50.svg' },
      { id: 'b9066e33-441c-4efc-b0f8-4ed1a1332ea5', coverUrl: '/ai-covers/b9066e33-441c-4efc-b0f8-4ed1a1332ea5.svg' },
      { id: 'ce14c6a7-6f8d-4d37-94d3-ca941942aa92', coverUrl: '/ai-covers/ce14c6a7-6f8d-4d37-94d3-ca941942aa92.svg' },
      { id: '641592d1-cf3a-4bea-ae4b-88ae283b40d5', coverUrl: '/ai-covers/641592d1-cf3a-4bea-ae4b-88ae283b40d5.svg' },
      { id: '69611b75-ac8c-4a74-991c-946cde526044', coverUrl: '/ai-covers/69611b75-ac8c-4a74-991c-946cde526044.svg' },
      { id: '0365165a-d499-4b47-9573-255c1dbe4ef4', coverUrl: '/ai-covers/0365165a-d499-4b47-9573-255c1dbe4ef4.svg' },
      { id: '49b84f81-5286-4cc1-85fd-7302f20bfd9b', coverUrl: '/ai-covers/49b84f81-5286-4cc1-85fd-7302f20bfd9b.svg' },
      { id: '74826407-8576-435c-bf77-80f497139c38', coverUrl: '/ai-covers/74826407-8576-435c-bf77-80f497139c38.svg' },
      { id: '6295da35-0ecb-4f2c-82c7-921ed0ed428b', coverUrl: '/ai-covers/6295da35-0ecb-4f2c-82c7-921ed0ed428b.svg' },
      { id: '89caadae-e349-4ecf-96c1-1046c832023d', coverUrl: '/ai-covers/89caadae-e349-4ecf-96c1-1046c832023d.svg' },
      { id: '295f79b1-15bf-4ddb-88ff-bd804c497832', coverUrl: '/ai-covers/295f79b1-15bf-4ddb-88ff-bd804c497832.svg' },
      { id: '0955331c-c786-4bad-8d73-2ab939c9a23d', coverUrl: '/ai-covers/0955331c-c786-4bad-8d73-2ab939c9a23d.svg' },
      { id: '6cbb6b83-d106-413d-95f9-d5284a657726', coverUrl: '/ai-covers/6cbb6b83-d106-413d-95f9-d5284a657726.svg' },
      { id: '3d9478ab-9967-4311-a2d4-039dd0fcf02c', coverUrl: '/ai-covers/3d9478ab-9967-4311-a2d4-039dd0fcf02c.svg' },
      { id: 'e6156973-00f0-4a0a-be4e-086c3a58b577', coverUrl: '/ai-covers/e6156973-00f0-4a0a-be4e-086c3a58b577.svg' },
      { id: 'c1eb086f-b794-4a47-825a-a182ae2f3bb6', coverUrl: '/ai-covers/c1eb086f-b794-4a47-825a-a182ae2f3bb6.svg' },
      { id: 'd70edb81-256b-43e2-9b70-7ab9bed02645', coverUrl: '/ai-covers/d70edb81-256b-43e2-9b70-7ab9bed02645.svg' },
    ];
    let aiCount = 0;
    for (const update of updates) {
      await prisma.book.update({
        where: { id: update.id },
        data: { coverImage: update.coverUrl }
      });
      aiCount++;
    }
    console.log(`✅ Re-applied ${aiCount} AI covers.\n`);
    
    console.log('🎉 REVERT COMPLETE! All books should be back to their perfectly working state.');

  } catch (error) {
    console.error('❌ Error during revert:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertCovers();
