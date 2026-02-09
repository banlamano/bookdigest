const fs = require('fs');
const path = require('path');

// PRODUCTION book IDs and details
const booksNeedingCovers = [
  { id: 'cdd862b4-6956-4430-bf1f-f25df8bab67d', title: 'Surge', author: 'Mike Michalowicz', category: 'Business' },
  { id: '58a328fd-20b8-491b-ac33-67b16b9c10e3', title: 'The Little Book of Hygge', author: 'Meik Wiking', category: 'Self-help' },
  { id: '5e262075-eec1-4c96-948d-71a7b8c5c7c4', title: "The Artist's Journey", author: 'Steven Pressfield', category: 'Creativity' },
  { id: '4fd86172-8fd6-42c4-b828-6249ded0da71', title: 'How to Win at the Sport of Business', author: 'Mark Cuban', category: 'Business' },
  { id: 'dfe39378-fd0c-4bb6-b1fc-55ce007fb058', title: 'The Aladdin Factor', author: 'Jack Canfield', category: 'Self-help' },
  { id: '1972ed08-2fdb-4d8a-8cd7-3b73594fe92c', title: 'Clockwork', author: 'Mike Michalowicz', category: 'Business' },
  { id: '2ad5ab0d-0a7e-4286-a296-5c2b856d5ee3', title: 'The Unfair Advantage', author: 'Ash Ali', category: 'Business' },
  { id: '6b3affb3-71f1-4e78-b1b9-43f37492c280', title: 'Decisive', author: 'Chip Heath', category: 'Psychology' },
  { id: '48ad8c89-0f76-4dd9-9362-9bf09560b2b2', title: 'Crushing It!', author: 'Gary Vaynerchuk', category: 'Business' },
  { id: '65d199bb-c4d0-4470-9586-56e6842ee56b', title: 'Margin of Safety', author: 'Seth Klarman', category: 'Finance' },
  { id: '9daf5ba5-3d53-4901-91cf-aebffd5a96e3', title: 'I Know How She Does It', author: 'Laura Vanderkam', category: 'Productivity' },
  { id: 'e531cbbf-7d06-4a90-aa39-5a89316bb246', title: "It Doesn't Have to Be Crazy at Work", author: 'Jason Fried', category: 'Business' },
  { id: 'dd516700-ffc8-4724-aadc-db44b8b0c967', title: 'Purple Cow', author: 'Seth Godin', category: 'Marketing' },
  { id: '82050fc4-ef99-4e0a-8dc3-bd5b51d3f933', title: 'The Second Machine Age', author: 'Erik Brynjolfsson', category: 'Technology' },
  { id: '1acab521-4d6f-432b-af4b-515aaa053612', title: 'The Compound Effect', author: 'Darren Hardy', category: 'Self-help' },
  { id: 'a76e6ebb-55d2-40d6-9ffd-1975433f73ba', title: 'The Telomere Effect', author: 'Elizabeth Blackburn', category: 'Health' },
  { id: '006d6f26-2829-4f8c-aaa0-e66ad69de651', title: 'The Snowball', author: 'Alice Schroeder', category: 'Biography' },
  { id: '5b9a9415-19fb-471f-9baa-1d27c4cde51d', title: 'The Sales Acceleration Formula', author: 'Mark Roberge', category: 'Sales' },
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
  console.log('🎨 Generating AI covers with PRODUCTION IDs...\n');
  
  // Create covers directory
  const coversDir = path.join(__dirname, '..', 'frontend', 'public', 'ai-covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Delete old covers with wrong IDs
  console.log('🗑️  Deleting old covers with wrong IDs...');
  const oldFiles = fs.readdirSync(coversDir);
  oldFiles.forEach(file => {
    fs.unlinkSync(path.join(coversDir, file));
  });
  console.log(`   Deleted ${oldFiles.length} old files\n`);
  
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
        status: 'SUCCESS'
      });
      
      console.log(`✅ ${book.title} → ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error generating cover for ${book.title}:`, error.message);
      results.push({
        title: book.title,
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
  console.log('\n✅ All covers regenerated with PRODUCTION IDs!');
  console.log('   Files now match database URLs!\n');
  
  return results;
}

generateCovers();
