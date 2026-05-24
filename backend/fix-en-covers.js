require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getImageSize(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(-1);
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let size = parseInt(res.headers['content-length'] || 0, 10);
      if (size > 0) return resolve(size);
      let actual = 0;
      res.on('data', c => actual += c.length);
      res.on('end', () => resolve(actual));
    });
    req.on('error', () => resolve(-1));
    req.setTimeout(6000, () => { req.destroy(); resolve(-2); });
  });
}

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

async function getGoogleBooksCover(title, author, isbn) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
  // Try ISBN first (most precise)
  if (isbn) {
    const q = encodeURIComponent(`isbn:${isbn}`);
    try {
      const data = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1${apiKey}`);
      if (data.items && data.items[0]) {
        const img = data.items[0].volumeInfo?.imageLinks;
        if (img) {
          const cover = img.large || img.medium || img.thumbnail || img.smallThumbnail;
          if (cover) return cover.replace('zoom=1', 'zoom=3').replace('&edge=curl', '').replace('http://', 'https://');
        }
      }
    } catch (e) { /* ignore */ }
    await sleep(200);
  }
  // Fallback: title + author
  const q = encodeURIComponent(`${title} ${author}`);
  try {
    const data = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5${apiKey}`);
    if (data.items) {
      for (const item of data.items) {
        const img = item.volumeInfo?.imageLinks;
        if (img) {
          const cover = img.large || img.medium || img.thumbnail || img.smallThumbnail;
          if (cover) return cover.replace('zoom=1', 'zoom=3').replace('&edge=curl', '').replace('http://', 'https://');
        }
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

// Known placeholder sizes returned by OpenLibrary
const PLACEHOLDER_SIZES = new Set([9, 43, 0, -1, -2]);

async function run() {
  console.log('🔍 Checking English books for broken OpenLibrary covers...\n');

  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { id: true, title: true, author: true, isbn: true, coverImage: true }
  });

  console.log(`Total EN books: ${enBooks.length}`);

  // Phase 1: Find broken ones
  const broken = [];
  let checked = 0;
  for (const book of enBooks) {
    const size = await getImageSize(book.coverImage);
    if (PLACEHOLDER_SIZES.has(size)) {
      broken.push({ ...book, brokenSize: size });
    }
    checked++;
    if (checked % 50 === 0) process.stdout.write(`\r  Checked ${checked}/${enBooks.length}...`);
    await sleep(50);
  }
  console.log(`\n\nFound ${broken.length} English books with broken covers.\n`);

  if (broken.length === 0) {
    console.log('✅ All English covers are fine!');
    await prisma.$disconnect();
    return;
  }

  // Phase 2: Fix each with Google Books
  let fixed = 0;
  let failed = 0;
  for (const book of broken) {
    const cover = await getGoogleBooksCover(book.title, book.author, book.isbn);
    await sleep(300);
    if (cover) {
      await prisma.book.update({ where: { id: book.id }, data: { coverImage: cover } });
      console.log(`✅ Fixed: "${book.title}" (was ${book.brokenSize} bytes)`);
      fixed++;
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
