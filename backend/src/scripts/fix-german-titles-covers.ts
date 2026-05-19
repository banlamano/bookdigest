import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Uses GEMINI_API_KEY (already in .env) for title lookup
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
// Optional Google Books API key for covers (add GOOGLE_BOOKS_API_KEY to .env)
const BOOKS_KEY = process.env.GOOGLE_BOOKS_API_KEY && process.env.GOOGLE_BOOKS_API_KEY !== 'optional_for_local_dev'
  ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}`
  : '';

if (!GEMINI_KEY) {
  console.error('❌ GEMINI_API_KEY not set in .env. Aborting.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface BookInfo {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
}

interface GeminiResult {
  id: string;
  germanTitle: string | null;
}

// Ask Gemini to look up official German published titles for a batch of books
async function getGermanTitlesFromGemini(books: BookInfo[]): Promise<GeminiResult[]> {
  const bookList = books.map((b, i) => `${i + 1}. "${b.title}" by ${b.author}`).join('\n');

  const prompt = `You are a book expert. For each book below, provide the OFFICIAL German published title (the actual title used in the German edition, not a translation).
If the book has no German edition or you're not sure, write "KEEP_ORIGINAL".
Do NOT translate the title word-for-word — only provide real published German titles.

Books:
${bookList}

Respond with ONLY a JSON array in this exact format (no markdown, no explanation):
[{"index":1,"germanTitle":"Die offizielle deutsche Titel"},{"index":2,"germanTitle":"KEEP_ORIGINAL"},...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown code blocks if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: Array<{ index: number; germanTitle: string }> = JSON.parse(clean);
    
    return parsed.map(item => ({
      id: books[item.index - 1]?.id || '',
      germanTitle: item.germanTitle === 'KEEP_ORIGINAL' ? null : item.germanTitle,
    }));
  } catch (err: any) {
    console.error(`  ⚠️  Gemini batch error: ${err.message}`);
    return books.map(b => ({ id: b.id, germanTitle: null }));
  }
}

// Get German cover from Google Books using the German title
async function getGermanCover(germanTitle: string, author: string): Promise<string | null> {
  if (!BOOKS_KEY) return null; // No API key, skip cover updates

  try {
    const query = `${germanTitle} ${author.split(' ').pop()}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=de&maxResults=5${BOOKS_KEY}`;
    const res = await fetch(url);
    const data: any = await res.json();

    if (data.error) {
      if (data.error.code === 429 || data.error.message?.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      return null;
    }

    if (!data.items) return null;

    for (const item of data.items) {
      const vol = item.volumeInfo;
      if (vol.language !== 'de') continue;
      const rawCover = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail;
      if (!rawCover) continue;
      return rawCover.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
    }
  } catch (err: any) {
    if (err.message === 'QUOTA_EXCEEDED') throw err;
  }
  return null;
}

async function main() {
  console.log('🇩🇪 Fixing German book titles + covers...');
  console.log(`   📖 Title source: Gemini AI (${GEMINI_KEY ? '✅ key found' : '❌ missing'})`);
  console.log(`   🖼️  Cover source: Google Books API (${BOOKS_KEY ? '✅ key found' : '⚠️  no key - titles only'})\n`);

  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, author: true, coverImage: true },
    orderBy: { title: 'asc' },
  });

  console.log(`📚 ${books.length} German books to process.\n`);

  const BATCH_SIZE = 20; // Gemini handles 20 books per call efficiently
  let updatedTitles = 0;
  let updatedCovers = 0;
  let skipped = 0;
  let quotaError = false;

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(books.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (books ${i + 1}-${Math.min(i + BATCH_SIZE, books.length)})...`);

    // Step 1: Get German titles from Gemini
    const geminiResults = await getGermanTitlesFromGemini(batch);

    // Step 2: For each book, update title and fetch cover
    for (const result of geminiResults) {
      const book = books.find(b => b.id === result.id);
      if (!book) continue;

      process.stdout.write(`  "${book.title}" → `);

      const updateData: any = {};

      // Title update
      if (result.germanTitle && result.germanTitle !== book.title) {
        updateData.title = result.germanTitle;
        updatedTitles++;
        process.stdout.write(`"${result.germanTitle}" ✅`);
      } else {
        process.stdout.write(`[no change] `);
        skipped++;
      }

      // Cover update (only if we have Google Books API key)
      const titleForCover = result.germanTitle || book.title;
      if (BOOKS_KEY) {
        try {
          const cover = await getGermanCover(titleForCover, book.author);
          if (cover && cover !== book.coverImage) {
            updateData.coverImage = cover;
            updatedCovers++;
            process.stdout.write(` 🖼️ cover✅`);
          }
          await new Promise(r => setTimeout(r, 300)); // Rate limit for Books API
        } catch (err: any) {
          if (err.message === 'QUOTA_EXCEEDED') {
            console.log('\n\n⛔ Google Books API quota exceeded for covers. Titles still updated.');
            quotaError = true;
            // Continue processing titles even if covers fail
          }
        }
      }

      console.log('');

      // Save updates
      if (Object.keys(updateData).length > 0) {
        await prisma.book.update({ where: { id: book.id }, data: updateData });
      }
    }

    // Rate limit between Gemini batches
    if (i + BATCH_SIZE < books.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n====== DONE ======`);
  console.log(`✅ Titles updated:  ${updatedTitles}`);
  console.log(`🖼️  Covers updated:  ${updatedCovers}`);
  console.log(`⚪ Kept original:   ${skipped}`);
  console.log(`📚 Total books:     ${books.length}`);
  if (quotaError) {
    console.log(`\n⚠️  Cover updates stopped due to Google Books quota.`);
    console.log(`   Add GOOGLE_BOOKS_API_KEY to .env for higher quota.`);
  }
  if (!BOOKS_KEY) {
    console.log(`\n💡 To also update covers, add GOOGLE_BOOKS_API_KEY to your .env file.`);
    console.log(`   Get a free key at: https://console.cloud.google.com`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
