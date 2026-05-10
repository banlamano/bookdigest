import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
});

// === CONFIG ===
const PROGRESS_FILE = path.resolve(process.cwd(), 'expand-progress.json');
const MIN_WORD_COUNT = 1000;          // Books under this get expanded
const MAX_DAILY_CALLS = 10000;          // Paid tier, virtually limitless
const WAIT_BETWEEN_CALLS_MS = 1000;   // Paid tier allows up to 360 RPM, this does 60 RPM which is extremely safe
const WAIT_AFTER_RATE_LIMIT_MS = 10000; // Small breather if throttled

let stats = { processed: 0, failed: 0, skipped: 0, alreadyDone: 0 };
let dailyCallCount = 0;

// === PROGRESS TRACKING ===
function loadProgress(): Set<string> {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`📂 Last run: ${data.lastUpdated || 'unknown'}`);
      return new Set(data.completed || []);
    }
  } catch {}
  return new Set();
}

function saveProgress(completed: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    completed: Array.from(completed),
    lastUpdated: new Date().toISOString(),
    stats,
    dailyCallCount
  }, null, 2));
}

// === API CALL WITH RETRY ===
async function generateWithRetry(prompt: string, label: string, maxAttempts = 6): Promise<any> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      dailyCallCount++;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/);
      if (!jsonMatch) throw new SyntaxError('No JSON found in response');
      return JSON.parse(jsonMatch[0]);
    } catch (e: any) {
      attempts++;
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        if (e.message?.includes('PerDay') || e.message?.includes('daily')) {
          console.log(`\n   ⛔ DAILY QUOTA EXHAUSTED. Script will exit. Re-run after midnight PT.`);
          throw new Error('DAILY_QUOTA_EXHAUSTED');
        }
        console.log(`   ⚠️ Rate limit [${label}] attempt ${attempts}/${maxAttempts}. Waiting ${WAIT_AFTER_RATE_LIMIT_MS/1000}s...`);
        await new Promise(r => setTimeout(r, WAIT_AFTER_RATE_LIMIT_MS));
      } else if (e.message?.includes('RECITATION') || e.message?.includes('blocked')) {
        console.log(`   ⚠️ Recitation block [${label}] attempt ${attempts}/${maxAttempts}. Retrying with modified prompt...`);
        await new Promise(r => setTimeout(r, 3000));
      } else if (e instanceof SyntaxError) {
        console.log(`   ⚠️ JSON parse [${label}] attempt ${attempts}/${maxAttempts}. Retrying...`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        console.error(`   ❌ Error [${label}]: ${e.message?.substring(0, 100)}`);
        if (attempts >= 3) throw e;
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw new Error(`Failed after ${maxAttempts} attempts: ${label}`);
}

// === EXPAND A SINGLE BOOK ===
async function expandSingleBook(bookId: string, title: string, author: string, language: 'en' | 'de') {
  const langInstruction = language === 'de'
    ? 'IMPORTANT: Write ALL content ENTIRELY in GERMAN (Deutsch). Every word must be in German.'
    : 'Write ALL content in English.';

  const prompt = `${langInstruction}
You are a literary expert writing premium, in-depth book summaries for a Blinkist-style app.
Generate a comprehensive JSON object for "${title}" by ${author}.

IMPORTANT: Write EXTENSIVE, DETAILED content. Use your OWN words as expert literary analysis. Do NOT copy verbatim text.

Return ONLY valid JSON:
{
  "summary": "Write a DETAILED 1200-1500 word summary. Structure it in multiple paragraphs separated by \\n\\n. Include: (1) A compelling 300-word overview of the book's core thesis, (2) 400 words explaining key arguments and evidence, (3) 300 words on Why It Matters and real-world applications, (4) 200 words as a Final Takeaway with lasting impact.",
  "keyInsights": [
    {"title": "Catchy specific insight title", "explanation": "Write 6-8 detailed analytical sentences, minimum 100 words, SPECIFIC to this book with concrete details", "example": "3-4 sentence concrete real-world example or case study from the book", "impact": "2-3 sentences on how this changes the reader's perspective or behavior"}
  ],
  "chapters": [
    {"number": 1, "title": "Chapter title or thematic section", "summary": "Write a DETAILED 200-300 word paragraph covering the main argument, supporting evidence, key stories, and practical takeaways of this chapter"}
  ],
  "quotes": ["Memorable quote 1", "Quote 2", "Quote 3", "Quote 4", "Quote 5", "Quote 6", "Quote 7", "Quote 8"],
  "actionItems": ["Detailed action step 1 with 2-3 sentences explaining how to implement it", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6", "Action 7", "Action 8"]
}

Requirements:
- 10-12 keyInsights with 100+ word explanations each
- 10-14 chapters with 200-300 word summaries each
- 8 memorable quotes
- 8 detailed actionItems
- Be SPECIFIC to "${title}". NO generic filler content.
- Total target: 4000-6000 words across all fields combined
- Return ONLY valid JSON, nothing else.`;

  const data = await generateWithRetry(prompt, `${title} [${language}]`);

  await prisma.book.update({
    where: { id: bookId },
    data: {
      summary: data.summary || '',
      keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights.map((i: any) => ({
        title: i.title || '', explanation: i.explanation || '',
        example: i.example || '', impact: i.impact || ''
      })) : [],
      chapters: Array.isArray(data.chapters) ? data.chapters.map((ch: any) => ({
        number: ch.number || 0, title: ch.title || '', summary: ch.summary || ''
      })) : [],
      quotes: Array.isArray(data.quotes) ? data.quotes : [],
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : []
    }
  });
}

// === MAIN ===
async function main() {
  console.log('🚀 BookDigest — Batch Summary Expansion');
  console.log('='.repeat(60));
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log(`🔧 Model: gemini-flash-latest | Max daily calls: ${MAX_DAILY_CALLS}`);
  console.log(`📏 Expanding books with summary < ${MIN_WORD_COUNT} words\n`);

  // Load resume progress
  const completed = loadProgress();

  // Fetch all books
  const allBooks = await prisma.book.findMany({
    select: { id: true, title: true, originalTitle: true, language: true, author: true, summary: true }
  });

  // Find short books
  const shortBooks = allBooks
    .filter(b => {
      const wc = (b.summary || '').trim().split(/\s+/).filter(w => w.length > 0).length;
      return wc < MIN_WORD_COUNT;
    })
    .map(b => ({
      ...b,
      words: (b.summary || '').trim().split(/\s+/).filter(w => w.length > 0).length
    }));

  const englishBooks = shortBooks.filter(b => b.language === 'en').sort((a, b) => a.words - b.words);
  const germanMap = new Map<string, typeof shortBooks[0]>();
  shortBooks.filter(b => b.language === 'de').forEach(b => {
    if (b.originalTitle) germanMap.set(b.originalTitle, b);
    germanMap.set(b.title, b);
  });

  // Filter out completed
  const pendingEN = englishBooks.filter(b => !completed.has(b.id));

  console.log(`📊 Short books: ${shortBooks.length} total (${englishBooks.length} EN, ${shortBooks.length - englishBooks.length} DE)`);
  console.log(`✅ Already completed: ${completed.size}`);
  console.log(`📋 Pending this session: ${pendingEN.length} English books\n`);

  if (pendingEN.length === 0) {
    console.log('🎉 All books have been expanded! Nothing to do.');
    return;
  }

  // Process books
  for (let i = 0; i < pendingEN.length; i++) {
    const enBook = pendingEN[i];
    const lookupTitle = enBook.originalTitle || enBook.title;

    // Check daily limit
    if (dailyCallCount >= MAX_DAILY_CALLS) {
      console.log(`\n⛔ Daily API limit reached (${dailyCallCount} calls). Re-run tomorrow.`);
      break;
    }

    const globalIdx = completed.size + 1;
    console.log(`\n[${i + 1}/${pendingEN.length}] (#${globalIdx}) 📚 "${lookupTitle}" (${enBook.words}w)`);

    try {
      // English
      console.log(`   🇬🇧 Expanding English...`);
      await expandSingleBook(enBook.id, lookupTitle, enBook.author, 'en');
      stats.processed++;
      completed.add(enBook.id);
      console.log(`   ✅ English done!`);

      await new Promise(r => setTimeout(r, WAIT_BETWEEN_CALLS_MS));

      // German counterpart
      const deBook = germanMap.get(enBook.title);
      if (deBook && !completed.has(deBook.id)) {
        console.log(`   🇩🇪 Expanding German...`);
        try {
          await expandSingleBook(deBook.id, lookupTitle, enBook.author, 'de');
          stats.processed++;
          completed.add(deBook.id);
          console.log(`   ✅ German done!`);
        } catch (e: any) {
          if (e.message === 'DAILY_QUOTA_EXHAUSTED') throw e;
          console.error(`   ❌ German failed: ${e.message?.substring(0, 80)}`);
          stats.failed++;
        }
      } else {
        stats.skipped++;
      }

      // Save progress after each pair
      saveProgress(completed);

      const eta = ((pendingEN.length - i - 1) * (WAIT_BETWEEN_CALLS_MS * 2 + 8000)) / 60000;
      console.log(`   📊 Done: ${stats.processed} | Failed: ${stats.failed} | API calls: ${dailyCallCount} | ETA: ~${eta.toFixed(0)}min`);

      await new Promise(r => setTimeout(r, WAIT_BETWEEN_CALLS_MS));

    } catch (e: any) {
      if (e.message === 'DAILY_QUOTA_EXHAUSTED') {
        saveProgress(completed);
        break;
      }
      console.error(`   ❌ FAILED "${lookupTitle}": ${e.message?.substring(0, 80)}`);
      stats.failed++;
      saveProgress(completed);
      console.log('   ⏳ Waiting 30s after failure...');
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  // Final report
  saveProgress(completed);
  console.log('\n' + '='.repeat(60));
  console.log('🏁 SESSION COMPLETE');
  console.log(`   ⏰ Ended: ${new Date().toLocaleString()}`);
  console.log(`   ✅ Processed: ${stats.processed}`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   ⏭️ Skipped: ${stats.skipped}`);
  console.log(`   📞 API calls: ${dailyCallCount}`);
  console.log(`   📂 Total completed (all sessions): ${completed.size}`);

  const remaining = shortBooks.length - completed.size;
  if (remaining > 0) {
    console.log(`\n   📋 Remaining: ${remaining} books`);
    console.log(`   💡 Re-run this script to continue from where it left off.`);
    console.log(`   ⏰ API quota resets at midnight Pacific Time (~9:00 AM CET).`);
  } else {
    console.log(`\n   🎉 ALL BOOKS EXPANDED! 🎉`);
  }
}

main()
  .catch(e => { 
    if (e.message !== 'DAILY_QUOTA_EXHAUSTED') console.error('FATAL:', e); 
    process.exit(e.message === 'DAILY_QUOTA_EXHAUSTED' ? 0 : 1); 
  })
  .finally(() => prisma.$disconnect());
