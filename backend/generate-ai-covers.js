const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Books needing AI-generated covers
const booksNeedingCovers = [
  { title: 'Surge', author: 'Mike Michalowicz', category: 'Business' },
  { title: 'The Little Book of Hygge', author: 'Meik Wiking', category: 'Self-help' },
  { title: "The Artist's Journey", author: 'Steven Pressfield', category: 'Creativity' },
  { title: 'How to Win at the Sport of Business', author: 'Mark Cuban', category: 'Business' },
  { title: 'The Aladdin Factor', author: 'Jack Canfield', category: 'Self-help' },
  { title: 'Clockwork', author: 'Mike Michalowicz', category: 'Business' },
  { title: 'The Unfair Advantage', author: 'Ash Ali', category: 'Business' },
  { title: 'Decisive', author: 'Chip Heath', category: 'Psychology' },
  { title: 'Crushing It!', author: 'Gary Vaynerchuk', category: 'Business' },
  { title: 'Margin of Safety', author: 'Seth Klarman', category: 'Finance' },
  { title: 'I Know How She Does It', author: 'Laura Vanderkam', category: 'Productivity' },
  { title: "It Doesn't Have to Be Crazy at Work", author: 'Jason Fried', category: 'Business' },
  { title: 'Purple Cow', author: 'Seth Godin', category: 'Marketing' },
  { title: 'The Second Machine Age', author: 'Erik Brynjolfsson', category: 'Technology' },
  { title: 'The Compound Effect', author: 'Darren Hardy', category: 'Self-help' },
  { title: 'The Telomere Effect', author: 'Elizabeth Blackburn', category: 'Health' },
  { title: 'The Snowball', author: 'Alice Schroeder', category: 'Biography' },
  { title: 'The Sales Acceleration Formula', author: 'Mark Roberge', category: 'Sales' },
];

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

// Generate SVG cover
function generateSVGCover(book) {
  const colors = categoryColors[book.category] || categoryColors['Business'];
  
  // Truncate long titles
  const titleLines = splitTitle(book.title, 25);
  const authorLines = splitAuthor(book.author, 30);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${book.title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="600" fill="url(#grad-${book.title.replace(/\s+/g, '')})" />
  
  <!-- Decorative pattern -->
  <g opacity="0.1">
    ${generatePattern()}
  </g>
  
  <!-- Title -->
  <g filter="url(#shadow)">
    ${titleLines.map((line, i) => `
      <text x="200" y="${120 + (i * 45)}" 
            font-family="Arial, sans-serif" 
            font-size="36" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle">
        ${escapeXml(line)}
      </text>
    `).join('')}
  </g>
  
  <!-- Author -->
  <g filter="url(#shadow)">
    ${authorLines.map((line, i) => `
      <text x="200" y="${480 + (i * 30)}" 
            font-family="Arial, sans-serif" 
            font-size="22" 
            fill="${colors.text}" 
            text-anchor="middle">
        ${escapeXml(line)}
      </text>
    `).join('')}
  </g>
  
  <!-- Category badge -->
  <g>
    <rect x="20" y="20" width="${book.category.length * 12 + 30}" height="35" 
          rx="17.5" fill="rgba(255,255,255,0.2)" />
    <text x="${20 + (book.category.length * 12 + 30) / 2}" y="42" 
          font-family="Arial, sans-serif" 
          font-size="14" 
          font-weight="bold"
          fill="white" 
          text-anchor="middle">
      ${book.category.toUpperCase()}
    </text>
  </g>
  
  <!-- Bottom accent line -->
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
  
  return lines.slice(0, 3); // Max 3 lines for title
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
  
  return lines.slice(0, 2); // Max 2 lines for author
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateCovers() {
  console.log('🎨 Generating AI covers for 18 books...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  // Create covers directory
  const coversDir = path.join(__dirname, '..', 'frontend', 'public', 'ai-covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  const results = [];
  
  for (const book of booksNeedingCovers) {
    try {
      // Find book in database
      const dbBook = await prisma.book.findFirst({
        where: {
          OR: [
            { title: { contains: book.title } },
            {
              AND: [
                { title: { contains: book.title.split(' ')[0] } },
                { author: { contains: book.author.split(' ')[0] } }
              ]
            }
          ]
        }
      });
      
      if (!dbBook) {
        console.log(`⚠️  Book not found: ${book.title}`);
        continue;
      }
      
      // Generate SVG
      const svg = generateSVGCover(book);
      const filename = `${dbBook.id}.svg`;
      const filepath = path.join(coversDir, filename);
      
      // Save SVG file
      fs.writeFileSync(filepath, svg);
      
      // Update database with new cover URL
      const coverUrl = `/ai-covers/${filename}`;
      await prisma.book.update({
        where: { id: dbBook.id },
        data: { coverImage: coverUrl }
      });
      
      results.push({
        id: dbBook.id,
        title: dbBook.title,
        author: dbBook.author,
        coverUrl: coverUrl,
        status: 'SUCCESS'
      });
      
      console.log(`✅ ${book.title} - ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error generating cover for ${book.title}:`, error.message);
      results.push({
        title: book.title,
        author: book.author,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   Total: ${booksNeedingCovers.length}`);
  console.log(`   Success: ${results.filter(r => r.status === 'SUCCESS').length}`);
  console.log(`   Failed: ${results.filter(r => r.status === 'ERROR').length}`);
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
  
  return results;
}

generateCovers().catch(console.error);
