const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function getLength(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ url, len: 0 });
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let len = parseInt(res.headers['content-length'] || 0, 10);
      if (len > 0) return resolve({ url, len });
      let size = 0;
      res.on('data', c => size += c.length);
      res.on('end', () => resolve({ url, len: size }));
    });
    req.on('error', () => resolve({ url, len: -1 }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, len: -2 }); });
  });
}

async function run() {
  const books = await prisma.book.findMany({ where: { language: 'de' }, select: { id: true, title: true, coverImage: true } });
  console.log(`Checking ${books.length} DE books...`);
  
  let sizes = {};
  let checked = 0;
  let batchSize = 10;
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(b => getLength(b.coverImage).then(res => ({...res, title: b.title}))));
    
    for (const res of results) {
      if (!sizes[res.len]) sizes[res.len] = [];
      sizes[res.len].push(res.title);
    }
    
    checked += batch.length;
    process.stdout.write(`\rChecked ${checked}/${books.length}`);
  }
  
  console.log('\n\n--- Most common sizes ---');
  const sorted = Object.entries(sizes).sort((a, b) => b[1].length - a[1].length);
  for (const [len, titles] of sorted.slice(0, 5)) {
    console.log(`Size ${len} bytes: ${titles.length} books`);
    if (titles.length > 5) {
      console.log(`  Sample: ${titles.slice(0, 3).join(' | ')}`);
    }
  }
  
  await prisma.$disconnect();
}
run().catch(console.error);
