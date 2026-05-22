const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Color schemes by category
const categoryColors = {
  'Business': { bg: '#1e3a8a', text: '#60a5fa', accent: '#3b82f6' },
  'Self-help': { bg: '#7e22ce', text: '#c084fc', accent: '#a855f7' },
  'Creativity': { bg: '#be123c', text: '#fb7185', accent: '#f43f5e' },
  'Psychology': { bg: '#0e7490', text: '#67e8f9', accent: '#06b6d4' },
  'Finance': { bg: '#065f46', text: '#6ee7b7', accent: '#10b981' },
  'Productivity': { bg: '#c2410c', text: '#fdba74', accent: '#f97316' },
  'Marketing': { bg: '#9333ea', text: '#d8b4fe', accent: '#c084fc' },
  'Technology': { bg: '#1e40af', text: '#93c5fd', accent: '#60a5fa' },
  'Health': { bg: '#15803d', text: '#86efac', accent: '#22c55e' },
  'Biography': { bg: '#713f12', text: '#fcd34d', accent: '#f59e0b' },
  'Sales': { bg: '#991b1b', text: '#fca5a5', accent: '#ef4444' },
};

function generateSVGCover(book, categoryName) {
  const colors = categoryColors[categoryName] || categoryColors['Business'];
  const titleLines = splitTitle(book.title, 25);
  const authorLines = splitAuthor(book.author, 30);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${book.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="400" height="600" fill="url(#grad-${book.id})" />
  <g opacity="0.1">
    ${generatePattern()}
  </g>
  <g filter="url(#shadow)">
    ${titleLines.map((line, i) => `
      <text x="200" y="${120 + (i * 45)}" 
            font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">
        ${escapeXml(line)}
      </text>`).join('')}
  </g>
  <g filter="url(#shadow)">
    ${authorLines.map((line, i) => `
      <text x="200" y="${480 + (i * 30)}" 
            font-family="Arial, sans-serif" font-size="22" fill="${colors.text}" text-anchor="middle">
        ${escapeXml(line)}
      </text>`).join('')}
  </g>
  <g>
    <rect x="20" y="20" width="${categoryName.length * 12 + 30}" height="35" rx="17.5" fill="rgba(255,255,255,0.2)" />
    <text x="${20 + (categoryName.length * 12 + 30) / 2}" y="42" 
          font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
      ${categoryName.toUpperCase()}
    </text>
  </g>
  <rect x="0" y="590" width="400" height="10" fill="${colors.accent}" opacity="0.8" />
</svg>`;
}

function generatePattern() {
  let pattern = '';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 400;
    const y = Math.random() * 600;
    const size = 10 + Math.random() * 20;
    pattern += `<circle cx="${x}" cy="${y}" r="${size}" fill="white" />`;
  }
  return pattern;
}

function splitTitle(title, maxLength) {
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines.slice(0, 3);
}

function splitAuthor(author, maxLength) {
  if (author.length <= maxLength) return [author];
  const words = author.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines.slice(0, 2);
}

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function processBatch(batch, coversDir) {
  const promises = batch.map(async (dbBook) => {
    try {
      const categoryName = dbBook.category ? dbBook.category.name : 'Business';
      const svg = generateSVGCover(dbBook, categoryName);
      const filename = `${dbBook.id}.svg`;
      const filepath = path.join(coversDir, filename);
      
      fs.writeFileSync(filepath, svg);
      
      const coverUrl = `/ai-covers/${filename}`;
      await prisma.book.update({
        where: { id: dbBook.id },
        data: { coverImage: coverUrl }
      });
      return { id: dbBook.id, status: 'SUCCESS' };
    } catch (error) {
      return { id: dbBook.id, status: 'ERROR', error: error.message };
    }
  });
  return Promise.all(promises);
}

async function generateCovers() {
  console.log('🎨 Generating AI covers for ALL books (Batched)...');
  const coversDir = path.join(__dirname, '..', 'frontend', 'public', 'ai-covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  let allBooks = await prisma.book.findMany({ include: { category: true } });
  // Skip ones that are already generated
  // allBooks = allBooks.filter(b => !b.coverImage.startsWith('/ai-covers/'));
  
  console.log(`Found ${allBooks.length} books. Generating...`);
  
  const batchSize = 50;
  let results = [];
  
  for (let i = 0; i < allBooks.length; i += batchSize) {
    const batch = allBooks.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} / ${Math.ceil(allBooks.length / batchSize)}`);
    const batchResults = await processBatch(batch, coversDir);
    results = results.concat(batchResults);
  }
  
  console.log('\n============================================================');
  console.log('📊 SUMMARY:');
  console.log(`   Total: ${allBooks.length}`);
  console.log(`   Success: ${results.filter(r => r.status === 'SUCCESS').length}`);
  console.log(`   Failed: ${results.filter(r => r.status === 'ERROR').length}`);
  console.log('============================================================');
  
  await prisma.$disconnect();
}

generateCovers().catch(console.error);
