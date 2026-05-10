import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as crypto from 'node:crypto';

const prisma = new PrismaClient();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is required');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Models to rotate through to bypass individual rate limits
const MODELLIST = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
];
let currentModelIndex = 0;

function getNextModel() {
  const modelName = MODELLIST[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % MODELLIST.length;
  console.log(`  🤖 Using model: ${modelName}`);
  return genAI.getGenerativeModel({ model: modelName });
}

async function translateEntireBook(enBook: any, retryCount = 0): Promise<any> {
  const payloadToTranslate = {
    summary: enBook.summary,
    keyInsights: enBook.keyInsights,
    chapters: enBook.chapters,
    quotes: enBook.quotes,
    actionItems: enBook.actionItems
  };

  const prompt = `Translate the following JSON object representing book content from English to German.
Keep the exact same JSON structure, only translate the text values. Do NOT translate keys.
Return ONLY valid JSON.
JSON:
${JSON.stringify(payloadToTranslate, null, 2)}`;

  let text = '';
  try {
    const activeModel = getNextModel();
    const result = await activeModel.generateContent(prompt);
    const response = await result.response;
    text = response.text().trim();
  } catch (error: any) {
    if (retryCount < 5) {
      console.log(`  ⚠️ API limit hit or error. retrying (attempt ${retryCount + 1})...`);
      await new Promise(r => setTimeout(r, 10000)); // 10s wait
      return translateEntireBook(enBook, retryCount + 1);
    }
    throw error;
  }
  
  if (text.startsWith('```json')) text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse translated JSON:\n' + text);
  }
}

async function translateBook(enBook: any): Promise<void> {
  console.log(`\n📖 Translating: "${enBook.title}" by ${enBook.author}`);
  const translated = await translateEntireBook(enBook);
  
  const newId = crypto.randomUUID();
  await prisma.book.create({
    data: {
      id: newId,
      title: enBook.title,
      author: enBook.author,
      originalTitle: enBook.title,
      isbn: null,
      summary: translated.summary || enBook.summary,
      keyInsights: translated.keyInsights || enBook.keyInsights,
      readingTime: enBook.readingTime,
      coverImage: enBook.coverImage,
      audioUrl: null,
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
      amazonLink: enBook.amazonLink,
    }
  });
  
  console.log(`  ✅ Created German version: ${newId}`);
}

async function main() {
  console.log('🚀 Translating ONLY missing books...\n');

  // 1. Get all English books
  const enBooks = await prisma.book.findMany({
    where: { language: 'en' },
    select: { id: true, title: true, author: true, summary: true, keyInsights: true, chapters: true, quotes: true, actionItems: true, readingTime: true, coverImage: true, categoryId: true, tags: true, publishedYear: true, rating: true, amazonLink: true }
  });

  // 2. Get existing German book original titles
  const deBooks = await prisma.book.findMany({
    where: { language: 'de' },
    select: { originalTitle: true, title: true }
  });

  const deTitles = new Set(deBooks.map(b => b.originalTitle || b.title));
  
  const missing = [];
  for (const en of enBooks) {
    if (!deTitles.has(en.title)) {
      missing.push(en);
    }
  }

  console.log(`Found ${missing.length} missing books to translate.`);

  for (const book of missing) {
    try {
      await translateBook(book);
      // Wait a bit between calls
      console.log('  ⏳ Waiting 30 seconds for next book...');
      await new Promise(r => setTimeout(r, 30000));
    } catch (e) {
      console.error(`❌ Failed: "${book.title}" - ${e.message}`);
    }
  }

  console.log('\n✨ All missing books have been processed!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
