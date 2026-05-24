const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ url, isPlaceholder: false });
    
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let dataLength = 0;
      res.on('data', chunk => dataLength += chunk.length);
      res.on('end', () => {
        // Known placeholder sizes: Google Books placeholder is around 3.5kb to 5kb usually, but maybe it varies.
        // Wait, Open Library placeholder (1x1 pixel) is very small.
        resolve({
          url,
          status: res.statusCode,
          contentLength: parseInt(res.headers['content-length'] || dataLength, 10),
          isGoogleBooks: url.includes('books.google.com')
        });
      });
    });
    req.on('error', () => resolve({ url, error: true }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, error: 'timeout' }); });
  });
}

async function run() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, coverImage: true }
  });
  
  console.log(`Checking ${books.length} books...`);
  
  // First, let's find Henrietta Lacks to see what it's using
  const h = books.find(b => b.title.includes('Henrietta Lacks'));
  if (h) {
    const info = await checkUrl(h.coverImage);
    console.log('Henrietta Lacks Info:', info);
  }
  
  await prisma.$disconnect();
}
run().catch(console.error);
