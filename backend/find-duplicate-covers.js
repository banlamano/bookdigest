const { PrismaClient } = require('@prisma/client');
const https = require('https');
const crypto = require('crypto');
const prisma = new PrismaClient();

function downloadAndHash(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(null);
    
    https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        return resolve(downloadAndHash(redirectUrl));
      }
      
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        resolve({ url, hash, size: buffer.length });
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const books = await prisma.book.findMany({ select: { id: true, title: true, coverImage: true } });
  console.log(`Checking ${books.length} covers...`);
  
  const results = [];
  let done = 0;
  
  // Process in chunks of 20
  for (let i = 0; i < books.length; i += 20) {
    const chunk = books.slice(i, i + 20);
    const promises = chunk.map(async (b) => {
      const info = await downloadAndHash(b.coverImage);
      if (info) {
        results.push({ ...b, ...info });
      }
      done++;
      if (done % 50 === 0) process.stdout.write('.');
    });
    await Promise.all(promises);
  }
  
  console.log('\nAnalyzing hashes...');
  
  const hashGroups = {};
  for (const r of results) {
    if (!hashGroups[r.hash]) hashGroups[r.hash] = [];
    hashGroups[r.hash].push(r);
  }
  
  const placeholders = [];
  for (const [hash, group] of Object.entries(hashGroups)) {
    // If 2 or more books share the EXACT same image hash (and it's a downloaded HTTP image), it's highly likely a placeholder.
    if (group.length > 1) {
      console.log(`\nHash ${hash} (Size: ${group[0].size}) appears ${group.length} times:`);
      group.slice(0, 3).forEach(b => console.log(` - ${b.title} (${b.coverImage})`));
      if (group.length > 3) console.log(`   ... and ${group.length - 3} more`);
      placeholders.push(...group);
    }
  }
  
  // Save placeholders to a file so we know which IDs to reset
  const fs = require('fs');
  fs.writeFileSync('placeholders.json', JSON.stringify(placeholders, null, 2));
  console.log(`\nFound ${placeholders.length} books with duplicate/placeholder covers. Saved to placeholders.json`);
  
  await prisma.$disconnect();
}
run().catch(console.error);
