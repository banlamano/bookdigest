require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'GET', timeout: 10000 }, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'] || '';
      const contentLength = parseInt(res.headers['content-length'] || '0', 10);
      res.destroy();
      resolve({ url, status, contentType, contentLength });
    });
    req.on('error', (e) => resolve({ url, status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, error: 'timeout' }); });
    req.end();
  });
}

// Heuristics for "title looks English, not German"
// German signals: umlauts, ß, common German articles/prepositions/suffixes
const GERMAN_TOKENS = /(\b(der|die|das|den|dem|des|ein|eine|einer|einem|einen|und|oder|aber|nicht|mit|von|für|auf|im|am|zur|zum|durch|über|unter|nach|wie|warum|so|sich|wir|sie|ihr|ihre|ihren|ihres|wenn|weil|als|dass|sein|sind|werden|wurde|wurden|hat|haben|kann|können|muss|müssen|soll|sollen|will|wollen|machen|mehr|sehr|alle|alles|nur|noch|schon|auch|heute|morgen|gestern|jeder|jede|jedes|kein|keine|keinen)\b)|[äöüÄÖÜß]/i;

// English signals: common English-only words/articles that wouldn't appear in a German title
const ENGLISH_ONLY_TOKENS = /\b(the|of|and|to|for|with|how|why|what|when|where|your|you|our|their|his|her|its|are|is|was|were|be|been|being|has|have|had|do|does|did|will|would|could|should|about|from|through|into|over|under|before|after|between)\b/i;

function classifyTitle(title) {
  const hasGerman = GERMAN_TOKENS.test(title);
  const hasEnglish = ENGLISH_ONLY_TOKENS.test(title);
  // A title with German signals is fine, even if it also contains an English subtitle
  if (hasGerman) return 'ok';
  // Title with English-only tokens and no German signals is suspicious
  if (hasEnglish) return 'looks_english';
  // Neutral (likely proper noun / borrowed term)
  return 'neutral';
}

async function run() {
  // 1) Title quality check
  const all = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, coverImage: true }
  });

  const looksEnglish = [];
  const neutral = [];
  for (const b of all) {
    const cls = classifyTitle(b.title);
    if (cls === 'looks_english') looksEnglish.push(b);
    else if (cls === 'neutral') neutral.push(b);
  }

  console.log('=== Title Quality (DE) ===');
  console.log('Total DE:                ', all.length);
  console.log('OK (German signals):     ', all.length - looksEnglish.length - neutral.length);
  console.log('Looks English:           ', looksEnglish.length);
  console.log('Neutral (no signals):    ', neutral.length);

  if (looksEnglish.length > 0) {
    console.log('\n--- Titles flagged as looking English ---');
    looksEnglish.forEach(b => console.log(`  [${b.title}]`));
  }
  if (neutral.length > 0 && neutral.length <= 40) {
    console.log('\n--- Neutral titles (likely proper nouns; manual eyeball) ---');
    neutral.forEach(b => console.log(`  [${b.title}]`));
  } else if (neutral.length > 40) {
    console.log(`\n--- Showing first 40 neutral titles of ${neutral.length} ---`);
    neutral.slice(0, 40).forEach(b => console.log(`  [${b.title}]`));
  }

  // 2) Cover URL spot-check: 10 random Google covers
  const googleCovers = all.filter(b => b.coverImage.startsWith('https://books.google.com'));
  const sample = [];
  const pool = [...googleCovers];
  for (let i = 0; i < 10 && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    sample.push(pool.splice(idx, 1)[0]);
  }

  console.log('\n=== Google Cover URL Spot-Check (10 random) ===');
  const results = await Promise.all(sample.map(b => head(b.coverImage)));
  let ok = 0, bad = 0;
  results.forEach((r, i) => {
    const b = sample[i];
    const status = r.status;
    const ct = r.contentType || '';
    const sz = r.contentLength || 0;
    const isImage = ct.startsWith('image/');
    const good = status >= 200 && status < 400 && isImage;
    if (good) ok++; else bad++;
    console.log(`  [${good ? 'OK ' : 'BAD'}] ${status} ${ct} ${sz}B — ${b.title.substring(0, 60)}`);
    if (!good) console.log(`         URL: ${r.url}`);
  });
  console.log(`\nResult: ${ok}/${sample.length} healthy.`);

  await prisma.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
