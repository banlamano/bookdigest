const fs = require('fs');
const path = require('path');

// Books needing AI-generated covers with their IDs
const booksNeedingCovers = [
  { id: '74b0d5dc-6350-4b6e-9f44-39a66ff0c360', title: 'Surge', author: 'Mike Michalowicz', category: 'Business' },
  { id: '9abe3264-bb5c-4102-840c-8c1c21d2bf50', title: 'The Little Book of Hygge', author: 'Meik Wiking', category: 'Self-help' },
  { id: 'b9066e33-441c-4efc-b0f8-4ed1a1332ea5', title: "The Artist's Journey", author: 'Steven Pressfield', category: 'Creativity' },
  { id: 'ce14c6a7-6f8d-4d37-94d3-ca941942aa92', title: 'How to Win at the Sport of Business', author: 'Mark Cuban', category: 'Business' },
  { id: '641592d1-cf3a-4bea-ae4b-88ae283b40d5', title: 'The Aladdin Factor', author: 'Jack Canfield', category: 'Self-help' },
  { id: '69611b75-ac8c-4a74-991c-946cde526044', title: 'Clockwork', author: 'Mike Michalowicz', category: 'Business' },
  { id: '0365165a-d499-4b47-9573-255c1dbe4ef4', title: 'The Unfair Advantage', author: 'Ash Ali', category: 'Business' },
  { id: '49b84f81-5286-4cc1-85fd-7302f20bfd9b', title: 'Decisive', author: 'Chip Heath', category: 'Psychology' },
  { id: '74826407-8576-435c-bf77-80f497139c38', title: 'Crushing It!', author: 'Gary Vaynerchuk', category: 'Business' },
  { id: '6295da35-0ecb-4f2c-82c7-921ed0ed428b', title: 'Margin of Safety', author: 'Seth Klarman', category: 'Finance' },
  { id: '89caadae-e349-4ecf-96c1-1046c832023d', title: 'I Know How She Does It', author: 'Laura Vanderkam', category: 'Productivity' },
  { id: '295f79b1-15bf-4ddb-88ff-bd804c497832', title: "It Doesn't Have to Be Crazy at Work", author: 'Jason Fried', category: 'Business' },
  { id: '0955331c-c786-4bad-8d73-2ab939c9a23d', title: 'Purple Cow', author: 'Seth Godin', category: 'Marketing' },
  { id: '6cbb6b83-d106-413d-95f9-d5284a657726', title: 'The Second Machine Age', author: 'Erik Brynjolfsson', category: 'Technology' },
  { id: '3d9478ab-9967-4311-a2d4-039dd0fcf02c', title: 'The Compound Effect', author: 'Darren Hardy', category: 'Self-help' },
  { id: 'e6156973-00f0-4a0a-be4e-086c3a58b577', title: 'The Telomere Effect', author: 'Elizabeth Blackburn', category: 'Health' },
  { id: 'c1eb086f-b794-4a47-825a-a182ae2f3bb6', title: 'The Snowball', author: 'Alice Schroeder', category: 'Biography' },
  { id: 'd70edb81-256b-43e2-9b70-7ab9bed02645', title: 'The Sales Acceleration Formula', author: 'Mark Roberge', category: 'Sales' },
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

function generateSVGCover(book) {
  const colors = categoryColors[book.category] || categoryColors['Business'];
  
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
  
  <!-- Background -->
  <rect width="400" height="600" fill="url(#grad-${book.id})" />
  
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

function generateCovers() {
  console.log('🎨 Generating AI covers for 18 books...\n');
  
  // Create covers directory
  const coversDir = path.join(__dirname, '..', 'frontend', 'public', 'ai-covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  const results = [];
  
  for (const book of booksNeedingCovers) {
    try {
      // Generate SVG
      const svg = generateSVGCover(book);
      const filename = `${book.id}.svg`;
      const filepath = path.join(coversDir, filename);
      
      // Save SVG file
      fs.writeFileSync(filepath, svg);
      
      results.push({
        id: book.id,
        title: book.title,
        author: book.author,
        filename: filename,
        coverUrl: `/ai-covers/${filename}`,
        status: 'SUCCESS'
      });
      
      console.log(`✅ ${book.title} → ${filename}`);
      
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
  
  // Generate SQL update script
  console.log('\n📝 Generating SQL update script...');
  const sqlFile = path.join(__dirname, 'update-covers.sql');
  const sqlStatements = results
    .filter(r => r.status === 'SUCCESS')
    .map(r => `UPDATE "Book" SET "coverImage" = '${r.coverUrl}' WHERE id = '${r.id}';`)
    .join('\n');
  
  fs.writeFileSync(sqlFile, sqlStatements);
  console.log(`✅ SQL script saved: update-covers.sql\n`);
  
  return results;
}

generateCovers();
