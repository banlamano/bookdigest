const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

// List of books with missing covers
const missingCovers = [
  "Surge",
  "The Little Book of Hygge",
  "After You",
  "Still Me", 
  "Me Before You",
  "The Rosie Result",
  "Us Against You",
  "How to Walk",
  "How to Sit",
  "How to Relax",
  "How to Love",
  "The Art of Living",
  "The Practicing Mind",
  "Meditation for Fidgety Skeptics",
  "Faith",
  "Start Where You Are",
  "Full Catastrophe Living",
  "The Honeymoon Effect",
  "Goals!",
  "The Aladdin Factor",
  "As a Man Thinketh",
  "How to Win at the Sport of Business",
  "The 50th Law",
  "The Artist's Journey",
  "Turning Pro",
  "Who Will Cry When You Die?",
  "Peaks and Valleys",
  "The Present",
  "Clockwork",
  "The Unfair Advantage",
  "Crushing It!",
  "Trust Me I'm Lying",
  "Decisive",
  "The Dichotomy of Leadership",
  "Margin of Safety",
  "Buffett",
  "A Wealth of Common Sense",
  "The Bogleheads' Guide to Investing",
  "No-Drama Discipline",
  "The Gifts of Imperfect Parenting",
  "Lost Connections",
  "Redirect",
  "Thinking in Bets",
  "The Four Tendencies",
  "Getting Results the Agile Way",
  "Work Clean",
  "I Know How She Does It",
  "The Art of the Start 2.0",
  "It Doesn't Have to Be Crazy at Work",
  "The Sales Acceleration Formula",
  "Purple Cow",
  "Scaling Up",
  "The Second Machine Age",
  "The Telomere Effect",
  "Peak",
  "The Ultra Mind Solution",
  "The End of Alzheimer's",
  "Financial Freedom",
  "When",
  "The Compound Effect",
  "Off the Clock"
];

function searchGoogleBooks(title, author) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.items && result.items[0].volumeInfo.imageLinks) {
            const imageLinks = result.items[0].volumeInfo.imageLinks;
            // Get highest quality available
            const coverUrl = imageLinks.extraLarge || imageLinks.large || 
                           imageLinks.medium || imageLinks.small || imageLinks.thumbnail;
            resolve(coverUrl.replace('http:', 'https:'));
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function fixMissingCovers() {
  console.log('\n🔧 FIXING MISSING BOOK COVERS\n');
  console.log('=' .repeat(80));
  
  let fixed = 0;
  let notFound = 0;
  
  for (const title of missingCovers) {
    try {
      // Find the book
      const book = await prisma.book.findFirst({
        where: {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        }
      });
      
      if (!book) {
        console.log(`⚠️  Not found in DB: ${title}`);
        notFound++;
        continue;
      }
      
      // Check if cover is missing or placeholder
      if (book.coverImage && book.coverImage.includes('covers.openlibrary.org') && !book.coverImage.includes('default')) {
        console.log(`✅ Already has cover: ${book.title}`);
        continue;
      }
      
      console.log(`🔍 Searching for: ${book.title} by ${book.author}`);
      
      // Search Google Books
      const coverUrl = await searchGoogleBooks(book.title, book.author);
      
      if (coverUrl) {
        // Update the book
        await prisma.book.update({
          where: { id: book.id },
          data: { coverImage: coverUrl }
        });
        
        console.log(`   ✅ Fixed: ${book.title}`);
        console.log(`   URL: ${coverUrl.substring(0, 60)}...`);
        fixed++;
      } else {
        console.log(`   ❌ No cover found: ${book.title}`);
        notFound++;
      }
      
      // Rate limit: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error with ${title}:`, error.message);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ COVER FIX COMPLETE');
  console.log('='.repeat(80));
  console.log(`Fixed: ${fixed}`);
  console.log(`Not found/errors: ${notFound}`);
  console.log('='.repeat(80));
  
  await prisma.$disconnect();
}

fixMissingCovers()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
