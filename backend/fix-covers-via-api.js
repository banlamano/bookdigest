// Fix missing covers using the admin API endpoint
const https = require('https');
const fetch = require('node-fetch');

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
  { title: 'Crushing It!', author: 'Gary Vaynerchuk' }
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
              coverUrl = coverUrl.replace('http:', 'https:').replace('&edge=curl', '').replace('zoom=1', 'zoom=3');
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

async function getAllBooks() {
  const response = await fetch('https://bookdigest-lypx.onrender.com/api/books?page=1&limit=454');
  const data = await response.json();
  return data.data.books;
}

async function fixCovers() {
  console.log('\n🔧 FIXING MISSING BOOK COVERS VIA API\n');
  console.log('='.repeat(80));
  
  let fixed = 0;
  let notFound = 0;
  let alreadyOk = 0;
  
  // Get all books first
  console.log('📚 Fetching all books from production...');
  const allBooks = await getAllBooks();
  console.log(`✅ Got ${allBooks.length} books\n`);
  
  for (const bookInfo of problematicBooks) {
    try {
      // Find the book
      const book = allBooks.find(b => 
        b.title.toLowerCase().includes(bookInfo.title.toLowerCase())
      );
      
      if (!book) {
        console.log(`⚠️  Not found: ${bookInfo.title}`);
        notFound++;
        continue;
      }
      
      // Check if already has good cover
      if (book.coverImage && 
          book.coverImage.includes('googleapis.com')) {
        console.log(`✅ Already OK: ${book.title}`);
        alreadyOk++;
        continue;
      }
      
      console.log(`\n🔍 Fixing: ${book.title}`);
      
      // Search Google Books
      const coverUrl = await searchGoogleBooks(book.title, book.author);
      
      if (coverUrl) {
        // Update via API
        const response = await fetch('https://bookdigest-lypx.onrender.com/api/admin/update-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: book.id,
            coverImage: coverUrl
          })
        });
        
        if (response.ok) {
          console.log(`   ✅ FIXED!`);
          console.log(`   URL: ${coverUrl.substring(0, 60)}...`);
          fixed++;
        } else {
          console.log(`   ❌ Update failed: ${response.status}`);
          notFound++;
        }
      } else {
        console.log(`   ❌ No cover found in Google Books`);
        notFound++;
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ COVER FIX COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`✅ Already OK: ${alreadyOk}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`📊 Total: ${problematicBooks.length}`);
  console.log('='.repeat(80));
}

fixCovers()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  });
