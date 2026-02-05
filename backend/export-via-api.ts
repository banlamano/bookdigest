import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load local environment
dotenv.config({ path: '.env.dev' });

const prisma = new PrismaClient();

interface BookUpdate {
  id: number;
  summary: string;
  keyInsights: string;
  chapters: string;
  quotes: string;
  actionItems: string;
}

async function exportViaAPI() {
  console.log('\n🚀 Exporting to Production via API\n');
  console.log('─'.repeat(80));

  try {
    // Get all books from local database
    console.log('📚 Fetching books from local database...');
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        keyInsights: true,
        chapters: true,
        quotes: true,
        actionItems: true
      }
    });

    console.log(`✅ Found ${books.length} books\n`);

    // Count AI-generated
    const aiGenerated = books.filter(b => 
      b.summary.length > 800 && !b.summary.includes('transformative guide')
    ).length;

    console.log(`📊 Quality Check:`);
    console.log(`   Total: ${books.length}`);
    console.log(`   AI-generated: ${aiGenerated}`);
    console.log(`   Quality: ${((aiGenerated/books.length)*100).toFixed(1)}%\n`);

    // Update production via API
    console.log('📤 Updating production via API...\n');

    let updated = 0;
    let failed = 0;

    for (const book of books) {
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
          console.error(`   ❌ Failed: ${book.title} - ${response.status}`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Failed: ${book.title} - ${error}`);
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
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportViaAPI()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
