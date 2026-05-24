require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getBestGoogleCover(title, author, isbn) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
  
  async function search(q) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3${apiKey}`;
      const data = await fetchJson(url);
      if (data.items) {
        for (const item of data.items) {
          const img = item.volumeInfo?.imageLinks;
          if (img) {
            let cover = img.extraLarge || img.large || img.medium || img.small || img.thumbnail || img.smallThumbnail;
            if (cover) {
              return cover.replace('&edge=curl', '').replace('http://', 'https://');
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  if (isbn) {
    const cover = await search(encodeURIComponent(`isbn:${isbn}`));
    if (cover) return cover;
    await sleep(200);
  }
  
  return await search(encodeURIComponent(`${title} ${author}`));
}

async function run() {
  console.log('🔍 Fixing Google Books covers that got bad zoom levels...\n');

  const enBooks = await prisma.book.findMany({
    where: { 
      language: 'en',
      coverImage: { contains: 'google.com' }
    },
    select: { id: true, title: true, author: true, isbn: true, coverImage: true }
  });

  console.log(`Found ${enBooks.length} books to re-check.`);

  let fixed = 0;
  let failed = 0;
  for (const book of enBooks) {
    const newCover = await getBestGoogleCover(book.title, book.author, book.isbn);
    await sleep(300);
    
    if (newCover) {
      if (newCover !== book.coverImage) {
        await prisma.book.update({ where: { id: book.id }, data: { coverImage: newCover } });
        console.log(`✅ Fixed: "${book.title}"`);
        fixed++;
      } else {
        console.log(`➖ Unchanged: "${book.title}"`);
      }
    } else {
      console.log(`❌ No cover found: "${book.title}"`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Failed: ${failed}`);

  await prisma.$disconnect();
}

run().catch(console.error);
