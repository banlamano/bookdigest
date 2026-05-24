require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAiCovers() {
  console.log('🧹 Clearing /ai-covers/ paths from database (to use frontend SVG fallback)...');
  
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

  const books = await prisma.book.findMany({
    select: { id: true, title: true, coverImage: true, language: true }
  });

  const aiBooks = books.filter(b => b.coverImage && b.coverImage.startsWith('/ai-covers/'));
  
  let cleared = 0;
  for (const book of aiBooks) {
    if (!keepAiCovers.has(book.id)) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: '' } // Set to empty string so fallback triggers
      });
      cleared++;
      console.log(`Cleared: ${book.title}`);
    }
  }

  console.log(`\n✅ Cleared ${cleared} books. They will now use the dynamic SVG fallback.`);
  await prisma.$disconnect();
}

clearAiCovers().catch(console.error);
