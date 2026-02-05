import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load local env
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

const localPrisma = new PrismaClient();

// Production database
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://bookdigest_db_user:ORU4MsmTBBtSUAuZiDY01iMoIL7qrxC2@dpg-cu6i3g1u0jms73dudcfg-a.frankfurt-postgres.render.com/bookdigest_db?sslmode=require"
    }
  }
});

async function exportToProduction() {
  console.log('\n🚀 Starting Database Export to Production\n');
  console.log('─'.repeat(80));

  try {
    // Get all books from local database
    console.log('📚 Fetching books from local database...');
    const localBooks = await localPrisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        keyInsights: true,
        chapters: true,
        quotes: true,
        actionItems: true,
        coverImage: true,
        tags: true,
        publishedYear: true,
        rating: true,
        readTime: true
      }
    });

    console.log(`✅ Found ${localBooks.length} books in local database\n`);

    // Count AI-generated summaries
    const aiGenerated = localBooks.filter(b => 
      b.summary.length > 800 && 
      !b.summary.includes('transformative guide')
    ).length;

    console.log(`📊 Quality Check:`);
    console.log(`   Total books: ${localBooks.length}`);
    console.log(`   AI-generated: ${aiGenerated}`);
    console.log(`   Templates: ${localBooks.length - aiGenerated}`);
    console.log(`   Quality: ${((aiGenerated/localBooks.length)*100).toFixed(1)}%\n`);

    // Update production database
    console.log('📤 Updating production database...\n');

    let updated = 0;
    let failed = 0;

    for (const book of localBooks) {
      try {
        await prodPrisma.book.update({
          where: { id: book.id },
          data: {
            summary: book.summary,
            keyInsights: book.keyInsights,
            chapters: book.chapters,
            quotes: book.quotes,
            actionItems: book.actionItems
          }
        });

        updated++;
        
        if (updated % 50 === 0) {
          console.log(`   ✅ Updated ${updated}/${localBooks.length} books...`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to update: ${book.title}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ EXPORT COMPLETE!');
    console.log('='.repeat(80));
    console.log(`Total books: ${localBooks.length}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success rate: ${((updated/localBooks.length)*100).toFixed(1)}%`);
    console.log('='.repeat(80));

    console.log('\n🎉 Production database now has AI-generated summaries!\n');

  } catch (error) {
    console.error('\n❌ Export failed:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

exportToProduction()
  .then(() => {
    console.log('✨ Process completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });
