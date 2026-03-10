
const fs = require('fs');
const content = fs.readFileSync('c:/Users/Installation/Desktop/Website/BookLearn/frontend/src/components/LanguageProvider.tsx', 'utf8');

const enMatch = content.match(/en: {([\s\S]+?)\s+},/);
if (!enMatch) {
    console.log('No en: block found');
    process.exit(1);
}

const deLines = enMatch[1].split('\n');
const keys = {};
const duplicates = [];

deLines.forEach(line => {
    const match = line.match(/^\s+'([^']+)'\s*:/);
    if (match) {
        const key = match[1];
        if (keys[key]) {
            duplicates.push(key);
        }
        keys[key] = true;
    }
});

if (duplicates.length > 0) {
    console.log('Duplicates found:', duplicates);
} else {
    console.log('No duplicates found');
}
