import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Starting cleanup of duplicate German books...');

  // 1. Get all German books
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    orderBy: { createdAt: 'asc' } // Older first
  });

  console.log(`Found ${deBooks.length} total German books`);

  // 2. Group by title
  const booksByTitle = new Map<string, typeof deBooks>();
  
  for (const book of deBooks) {
    const title = book.title;
    if (!booksByTitle.has(title)) {
      booksByTitle.set(title, []);
    }
    booksByTitle.get(title)!.push(book);
  }

  let deletedCount = 0;
  let keepCount = 0;

  // 3. Process groups to find duplicates
  for (const [title, copies] of booksByTitle.entries()) {
    if (copies.length > 1) {
      // Sort by creation date just to be absolutely sure (oldest first)
      copies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // We want to KEEP the newest copy (the one with the actual German text generated on March 18)
      // We want to DELETE all older copies (which actually contain English text despite language='de')
      const copyToKeep = copies[copies.length - 1];
      const copiesToDelete = copies.slice(0, copies.length - 1);
      
      console.log(`\nTitle: "${title}" (${copies.length} copies)`);
      console.log(`  ✅ Keeping (Newest): ID ${copyToKeep.id} (Created: ${copyToKeep.createdAt.toISOString()})`);
      
      for (const toDelete of copiesToDelete) {
        console.log(`  🗑️ Deleting (Older): ID ${toDelete.id} (Created: ${toDelete.createdAt.toISOString()})`);
        
        try {
          // Delete from completely
          await prisma.book.delete({
            where: { id: toDelete.id }
          });
          deletedCount++;
        } catch (error: any) {
          console.error(`  ❌ Failed to delete book ${toDelete.id}:`, error.message);
        }
      }
    } else {
      keepCount++;
    }
  }

  console.log('\n================================================');
  console.log('  CLEANUP SUMMARY');
  console.log('================================================');
  console.log(`  Total duplicated groups processed: ${Array.from(booksByTitle.values()).filter(g => g.length > 1).length}`);
  console.log(`  ✅ Books kept safe: ${keepCount + Array.from(booksByTitle.values()).filter(g => g.length > 1).length}`);
  console.log(`  🗑️ Duplicate books deleted: ${deletedCount}`);
  console.log('================================================');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
