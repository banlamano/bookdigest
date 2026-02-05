// Fix missing covers by fetching from Google Books API
// Run with production database

const https = require('https');
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://bookdigest_db_user:ORU4MsmTBBtSUAuZiDY01iMoIL7qrxC2@dpg-cu6i3g1u0jms73dudcfg-a.frankfurt-postgres.render.com/bookdigest_db';

// Books with missing covers
const problematicBooks = [
  { title: 'Surge', author: 'Mike Michalowicz' },
  { title: 'The Little Book of Hygge', author: 'Meik Wiking' },
  { title: 'After You', author: 'Jojo Moyes' },
  { title: 'Still Me', author: 'Jojo Moyes' },
  { title: 'Me Before You', author: 'Jojo Moyes' },
  { title: 'The Rosie Result', author: 'Graeme Simsion' },
  { title: 'Us Against You', author: 'Fredrik Backman' },
  { title: 'How to Walk', author: 'Thich Nhat Hanh' },
  { title: 'How to Sit', author: 'Thich Nhat Hanh' },
  { title: 'How to Relax', author: 'Thich Nhat Hanh' },
  { title: 'How to Love', author: 'Thich Nhat Hanh' },
  { title: 'The Art of Living', author: 'Thich Nhat Hanh' },
  { title: 'The Practicing Mind', author: 'Thomas Sterner' },
  { title: 'Meditation for Fidgety Skeptics', author: 'Dan Harris' },
  { title: 'Faith', author: 'Sharon Salzberg' },
  { title: 'Start Where You Are', author: 'Pema Chödrön' },
  { title: 'Full Catastrophe Living', author: 'Jon Kabat-Zinn' },
  { title: 'The Honeymoon Effect', author: 'Bruce Lipton' },
  { title: 'Goals!', author: 'Brian Tracy' },
  { title: 'The Aladdin Factor', author: 'Jack Canfield' },
  { title: 'As a Man Thinketh', author: 'James Allen' },
  { title: 'The 50th Law', author: 'Robert Greene' },
  { title: "The Artist's Journey", author: 'Steven Pressfield' },
  { title: 'Turning Pro', author: 'Steven Pressfield' },
  { title: 'Who Will Cry When You Die?', author: 'Robin Sharma' },
  { title: 'Peaks and Valleys', author: 'Spencer Johnson' },
  { title: 'The Present', author: 'Spencer Johnson' },
  { title: 'Clockwork', author: 'Mike Michalowicz' },
  { title: 'The Unfair Advantage', author: 'Ash Ali' },
  { title: 'Crushing It!', author: 'Gary Vaynerchuk' },
  { title: "Trust Me I'm Lying", author: 'Ryan Holiday' },
  { title: 'Decisive', author: 'Chip Heath' },
  { title: 'The Dichotomy of Leadership', author: 'Jocko Willink' },
  { title: 'Margin of Safety', author: 'Seth Klarman' },
  { title: 'Buffett', author: 'Roger Lowenstein' },
  { title: 'A Wealth of Common Sense', author: 'Ben Carlson' },
  { title: "The Bogleheads' Guide to Investing", author: 'Taylor Larimore' },
  { title: 'No-Drama Discipline', author: 'Daniel Siegel' },
  { title: 'The Gifts of Imperfect Parenting', author: 'Brené Brown' },
  { title: 'Lost Connections', author: 'Johann Hari' },
  { title: 'Redirect', author: 'Timothy Wilson' },
  { title: 'Thinking in Bets', author: 'Annie Duke' },
  { title: 'The Four Tendencies', author: 'Gretchen Rubin' },
  { title: 'Getting Results the Agile Way', author: 'J.D. Meier' },
  { title: 'Work Clean', author: 'Dan Charnas' },
  { title: 'I Know How She Does It', author: 'Laura Vanderkam' },
  { title: 'The Art of the Start 2.0', author: 'Guy Kawasaki' },
  { title: "It Doesn't Have to Be Crazy at Work", author: 'Jason Fried' },
  { title: 'The Sales Acceleration Formula', author: 'Mark Roberge' },
  { title: 'Purple Cow', author: 'Seth Godin' },
  { title: 'Scaling Up', author: 'Verne Harnish' },
  { title: 'The Second Machine Age', author: 'Erik Brynjolfsson' },
  { title: 'The Telomere Effect', author: 'Elizabeth Blackburn' },
  { title: 'Peak', author: 'Marc Bubbs' },
  { title: 'The Ultra Mind Solution', author: 'Mark Hyman' },
  { title: "The End of Alzheimer's", author: 'Dale Bredesen' },
  { title: 'Financial Freedom', author: 'Grant Sabatier' },
  { title: 'When', author: 'Daniel Pink' },
  { title: 'The Compound Effect', author: 'Darren Hardy' },
  { title: 'Off the Clock', author: 'Laura Vanderkam' }
];

function searchGoogleBooks(title, author) {
  return new Promise((resolve) => {
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
            let coverUrl = imageLinks.large || imageLinks.medium || imageLinks.small || imageLinks.thumbnail;
            if (coverUrl) {
              coverUrl = coverUrl.replace('http:', 'https:').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
              resolve(coverUrl);
            } else {
              resolve(null);
            }
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

async function fixCovers() {
  console.log('\n🔧 FIXING MISSING BOOK COVERS\n');
  console.log('='.repeat(80));
  
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  await client.connect();
  
  let fixed = 0;
  let notFound = 0;
  let alreadyHas = 0;
  
  for (const bookInfo of problematicBooks) {
    try {
      // Find the book
      const result = await client.query(
        'SELECT id, title, author, "coverImage" FROM "Book" WHERE title ILIKE $1 LIMIT 1',
        [`%${bookInfo.title}%`]
      );
      
      if (result.rows.length === 0) {
        console.log(`⚠️  Not found in DB: ${bookInfo.title}`);
        notFound++;
        continue;
      }
      
      const book = result.rows[0];
      
      // Check if already has a good cover
      if (book.coverImage && 
          book.coverImage.includes('googleapis.com') || 
          (book.coverImage.includes('covers.openlibrary.org') && !book.coverImage.includes('-M.jpg'))) {
        console.log(`✅ Already OK: ${book.title}`);
        alreadyHas++;
        continue;
      }
      
      console.log(`\n🔍 Fixing: ${book.title} by ${book.author}`);
      
      // Search Google Books
      const coverUrl = await searchGoogleBooks(book.title, book.author);
      
      if (coverUrl) {
        // Update the book
        await client.query(
          'UPDATE "Book" SET "coverImage" = $1 WHERE id = $2',
          [coverUrl, book.id]
        );
        
        console.log(`   ✅ FIXED!`);
        console.log(`   New URL: ${coverUrl.substring(0, 70)}...`);
        fixed++;
      } else {
        console.log(`   ❌ No cover found`);
        notFound++;
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      notFound++;
    }
  }
  
  await client.end();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ COVER FIX COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`✅ Already had covers: ${alreadyHas}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`📊 Total processed: ${problematicBooks.length}`);
  console.log('='.repeat(80));
}

fixCovers()
  .then(() => {
    console.log('\n✨ Done! Covers have been updated in production database.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
