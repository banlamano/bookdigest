import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';


const prisma = new PrismaClient();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is required');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface TranslationStats {
  total: number;
  translated: number;
  skipped: number;
  failed: number;
}

/**
 * Translate the complete book content in a single shot
 */
async function translateEntireBook(enBook: any, retryCount = 0): Promise<any> {
  const payloadToTranslate = {
    summary: enBook.summary,
    keyInsights: enBook.keyInsights,
    chapters: enBook.chapters,
    quotes: enBook.quotes,
    actionItems: enBook.actionItems
  };

  const prompt = `Translate the following JSON object representing book content from English to German.
Keep the exact same JSON structure, only translate the text values.
Do NOT translate JSON keys.
Keep the original tone and style.
Return ONLY valid JSON.

JSON:
${JSON.stringify(payloadToTranslate, null, 2)}`;

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text().trim();
  } catch (error: any) {
    if ((error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('503')) && retryCount < 3) {
      console.log(`  ⚠️ API limit hit. Waiting 60s before retry ${retryCount + 1}/3...`);
      await new Promise(r => setTimeout(r, 60000));
      return translateEntireBook(enBook, retryCount + 1);
    }
    throw error;
  }
  
  // Clean JSON markup
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse translated JSON from Gemini:\n' + text);
  }
}

/**
 * Translate a single book from English to German
 */
async function translateBook(enBook: any): Promise<void> {
  console.log(`\n📖 Translating: "${enBook.title}" by ${enBook.author}`);
  
  // Request single JSON translation
  console.log('  → Translating entire book content at once...');
  const translated = await translateEntireBook(enBook);
  
  // Delay slightly to stay under the 15 RPM limit safely
  await new Promise(r => setTimeout(r, 8000));
  
  // Create German version of the book
  const newId = crypto.randomUUID();
  
  await prisma.book.create({
    data: {
      id: newId,
      title: enBook.title, // Keep original English title
      author: enBook.author,
      originalTitle: enBook.title, // Store reference to original
      isbn: null, // Don't duplicate ISBN
      summary: translated.summary || enBook.summary,
      keyInsights: translated.keyInsights || enBook.keyInsights,
      readingTime: enBook.readingTime,
      coverImage: enBook.coverImage, // Reuse same cover
      audioUrl: null, // Audio would need separate generation
      audioDuration: null,
      categoryId: enBook.categoryId,
      tags: enBook.tags,
      language: 'de',
      publishedYear: enBook.publishedYear,
      rating: enBook.rating,
      ratingsCount: 0,
      chapters: translated.chapters || enBook.chapters,
      quotes: translated.quotes || enBook.quotes,
      actionItems: translated.actionItems || enBook.actionItems,
      amazonLink: enBook.amazonLink, // Reuse same Amazon link
    }
  });
  
  console.log(`  ✅ Created German version: ${newId}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceAll = args.includes('--force');
  const batchSizeArg = args.find(a => a.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 5;
  const startFromArg = args.find(a => a.startsWith('--start-from='));
  const startFrom = startFromArg ? parseInt(startFromArg.split('=')[1]) : 0;

  if (args.includes('--help')) {
    console.log(`
📚 BookDigest Translation Script - English → German

Usage:
  npx tsx src/scripts/translate-books.ts [options]

Options:
  --dry-run          Show what would be done without making changes
  --force            Re-translate books that already have German versions
  --batch-size=N     Process N books at a time (default: 5)
  --start-from=N     Start from book number N (for resuming)
  --help             Show this help message

Examples:
  npx tsx src/scripts/translate-books.ts --dry-run
  npx tsx src/scripts/translate-books.ts --batch-size=3
  npx tsx src/scripts/translate-books.ts --start-from=50 --batch-size=10
`);
    process.exit(0);
  }

  console.log('🌍 BookDigest Translation: English → German\n');
  console.log('Configuration:');
  console.log(`  Batch size: ${batchSize}`);
  console.log(`  Start from: ${startFrom}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log(`  Force: ${forceAll}`);

  const stats: TranslationStats = { total: 0, translated: 0, skipped: 0, failed: 0 };

  // Get all English books
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    orderBy: { title: 'asc' },
  });

  // Get existing German book titles to avoid duplicates
  const existingDeBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { title: true, originalTitle: true },
  });
  const existingDeTitles = new Set([
    ...existingDeBooks.map(b => b.title),
    ...existingDeBooks.map(b => b.originalTitle).filter(Boolean),
  ]);

  stats.total = enBooks.length;
  console.log(`\n📚 Found ${stats.total} English books to translate`);
  console.log(`📗 ${existingDeBooks.length} German books already exist\n`);

  // Process books starting from offset
  const booksToProcess = enBooks.slice(startFrom);
  
  for (let i = 0; i < booksToProcess.length; i += batchSize) {
    const batch = booksToProcess.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(booksToProcess.length / batchSize);
    
    console.log(`\n━━━ Batch ${batchNum}/${totalBatches} (Books ${startFrom + i + 1}-${startFrom + Math.min(i + batchSize, booksToProcess.length)}) ━━━`);
    
    for (const book of batch) {
      // Skip if already translated
      if (!forceAll && existingDeTitles.has(book.title)) {
        console.log(`⏭️  Skipped: "${book.title}" (German version exists)`);
        stats.skipped++;
        continue;
      }
      
      if (dryRun) {
        console.log(`🔍 Would translate: "${book.title}" (summary: ${book.summary?.length || 0} chars)`);
        stats.translated++;
        continue;
      }
      
      try {
        await translateBook(book);
        stats.translated++;
      } catch (error: any) {
        console.error(`❌ Failed: "${book.title}" - ${error.message}`);
        stats.failed++;
        
        // If rate limited, wait longer
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          console.log('⏳ Rate limited, waiting 60 seconds...');
          await new Promise(r => setTimeout(r, 60000));
        }
      }
    }
    
    // Delay between batches
    if (i + batchSize < booksToProcess.length && !dryRun) {
      console.log('\n⏳ Waiting 15 seconds before next batch to cool down API limits...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  // Final report
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TRANSLATION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Total English books:  ${stats.total}`);
  console.log(`✅ Translated:        ${stats.translated}`);
  console.log(`⏭️  Skipped:           ${stats.skipped}`);
  console.log(`❌ Failed:            ${stats.failed}`);
  if (dryRun) console.log('\n💡 This was a DRY RUN. No changes were made.');
  console.log('═'.repeat(60));
}

main()
  .then(() => {
    console.log('\n✨ Translation process finished!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Translation process failed:', error);
    process.exit(1);
  });
