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
        catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getCoverFromGoogleBooks(title, author) {
  // Simple query without field operators — more forgiving
  const q = encodeURIComponent(`${title} ${author}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`;
  try {
    const data = await fetchJson(url);
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const img = item.volumeInfo?.imageLinks;
        if (img) {
          const cover = img.large || img.medium || img.thumbnail || img.smallThumbnail;
          if (cover) {
            return cover
              .replace('zoom=1', 'zoom=3')
              .replace('&edge=curl', '')
              .replace('http://', 'https://');
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function getCoverFromOpenLibrary(title, author) {
  // Search Open Library
  const q = encodeURIComponent(`${title} ${author}`);
  const url = `https://openlibrary.org/search.json?q=${q}&limit=5&fields=cover_i,title,author_name`;
  try {
    const data = await fetchJson(url);
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function run() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, author: true, originalTitle: true, coverImage: true, slug: true },
    orderBy: { title: 'asc' }
  });

  const noCover = books.filter(b => !b.coverImage || b.coverImage.startsWith('/ai-covers'));
  console.log(`Found ${noCover.length} German books needing covers (out of ${books.length} total)\n`);

  let updated = 0;
  let failed = 0;

  for (const book of noCover) {
    const searchTitle = book.originalTitle || book.title;
    let coverUrl = null;

    // 1. Try Google Books (simple query)
    coverUrl = await getCoverFromGoogleBooks(searchTitle, book.author);
    await sleep(250);

    // 2. Fallback: Open Library
    if (!coverUrl) {
      coverUrl = await getCoverFromOpenLibrary(searchTitle, book.author);
      await sleep(250);
    }

    if (coverUrl) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: coverUrl }
      });
      updated++;
      console.log(`✅ [${updated}] "${book.title}"\n      => ${coverUrl}`);
    } else {
      failed++;
      console.log(`❌ [no cover] "${book.title}" (searched: "${searchTitle}")`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Updated: ${updated}`);
  console.log(`No cover found: ${failed}`);

  await prisma.$disconnect();
}

run().catch(console.error);
