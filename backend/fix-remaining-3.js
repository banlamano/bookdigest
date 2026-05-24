require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Books that need manual cover lookup with alternative search terms
const manualFixes = [
  { 
    originalTitle: 'The Ultra Mind Solution',
    alternatives: ['Ultra Mind Solution Mark Hyman', 'UltraMind Solution', 'Mark Hyman brain'],
    author: 'Mark Hyman'
  },
  { 
    originalTitle: "It Doesn't Have to Be Crazy at Work",
    alternatives: ['Crazy at Work Jason Fried DHH', 'Doesnt Have to Be Crazy Work', 'calm company Jason Fried'],
    author: 'Jason Fried'
  },
  { 
    originalTitle: "So Good They Can't Ignore You",
    alternatives: ['So Good They Cant Ignore You Cal Newport', 'Cal Newport career', 'deep work Cal Newport skills'],
    author: 'Cal Newport'
  }
];

async function tryOpenLibrary(query) {
  const q = encodeURIComponent(query);
  const url = `https://openlibrary.org/search.json?q=${q}&limit=5&fields=cover_i,title,author_name`;
  try {
    const data = await fetchJson(url);
    if (data.docs?.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
  } catch (e) { /* skip */ }
  return null;
}

async function tryGoogleBooks(query) {
  const q = encodeURIComponent(query);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`;
  try {
    const data = await fetchJson(url);
    if (data.items?.length > 0) {
      for (const item of data.items) {
        const img = item.volumeInfo?.imageLinks;
        if (img) {
          const cover = img.large || img.medium || img.thumbnail || img.smallThumbnail;
          if (cover) return cover.replace('zoom=1','zoom=3').replace('&edge=curl','').replace('http://','https://');
        }
      }
    }
  } catch (e) { /* skip */ }
  return null;
}

async function run() {
  for (const fix of manualFixes) {
    console.log(`\nSearching for: "${fix.originalTitle}"`);
    let coverUrl = null;

    for (const alt of fix.alternatives) {
      coverUrl = await tryOpenLibrary(alt);
      if (!coverUrl) coverUrl = await tryGoogleBooks(alt);
      if (coverUrl) { console.log(`  Found with query: "${alt}"`); break; }
      console.log(`  No result for: "${alt}"`);
      await new Promise(r => setTimeout(r, 300));
    }

    if (coverUrl) {
      const book = await prisma.book.findFirst({ where: { originalTitle: fix.originalTitle, language: 'de' }, select: { id: true, title: true } });
      if (book) {
        await prisma.book.update({ where: { id: book.id }, data: { coverImage: coverUrl } });
        console.log(`✅ Updated "${book.title}" => ${coverUrl}`);
      } else {
        console.log(`⚠️  Book not found in DB for originalTitle="${fix.originalTitle}"`);
      }
    } else {
      console.log(`❌ No cover found for "${fix.originalTitle}"`);
    }
  }
  await prisma.$disconnect();
}

run().catch(console.error);
