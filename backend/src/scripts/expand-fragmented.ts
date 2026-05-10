import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const SHORT_BOOK_TITLES = [
  'How to Win at the Sport of Business',
  'The Bogleheads\' Guide to Investing',
  'The Man Who Mistook His Wife for a Hat',
  'True Refuge',
  'The Small Big',
  'The Power of Moments',
  'The Buddha and the Badass',
  'Grit',
  'Redirect',
  'The Monk Who Sold His Ferrari',
  'Perennial Seller',
  'Company of One',
  'Powerful'
];

async function generateFragment(prompt: string, label: string): Promise<any> {
  let attempts = 0;
  const MAX_ATTEMPTS = 15;
  while (attempts < MAX_ATTEMPTS) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      // Wait between successful calls to avoid RPM limits
      console.log(`   ✔ ${label} succeeded. Waiting 65s...`);
      await new Promise(r => setTimeout(r, 65000));
      return data;
    } catch (e: any) {
      attempts++;
      if (e.message.includes('429')) {
        const wait = 90 + (attempts * 10); // Escalating wait: 100s, 110s, 120s...
        console.log(`   ⚠️ Rate limited (429) attempt ${attempts}/${MAX_ATTEMPTS}. Waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else if (e instanceof SyntaxError) {
        // JSON parse error - retry with shorter wait
        console.log(`   ⚠️ JSON parse error attempt ${attempts}/${MAX_ATTEMPTS}. Retrying in 30s...`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        console.error(`   ❌ Unexpected error: ${e.message}`);
        throw e;
      }
    }
  }
  throw new Error(`Failed after ${MAX_ATTEMPTS} attempts for: ${label}`);
}

async function expandBookFragmented(title: string, author: string, language: 'en' | 'de') {
  console.log(`\n📚 [${language.toUpperCase()}] Expansion: "${title}"`);
  
  const langPrompt = language === 'de' ? 'IMPORTANT: Answer ONLY in GERMAN.' : 'Answer ONLY in English.';

  console.log('   🔸 Fragment 1/4: Summary...');
  const f1 = await generateFragment(`${langPrompt} Generate a JSON object for the book "${title}" by ${author}:
  {
    "bigIdea": "Punchy paragraph (100 words)",
    "whyItMatters": "3 paragraphs (300 words) on relevance and target audience",
    "finalTakeaway": "One powerful summary paragraph",
    "targetAudience": ["Person 1", "Person 2", "Person 3"]
  }`, `${title} [${language}] Summary`);

  console.log('   🔸 Fragment 2/4: Insights...');
  const f2 = await generateFragment(`${langPrompt} Generate a JSON list of 10 "keyInsights" for "${title}" by ${author}:
  [
    { "title": "Insight Title", "explanation": "4-6 sentences deep explanation", "example": "Real-world example", "impact": "Life impact" }
  ]`, `${title} [${language}] Insights`);

  console.log('   🔸 Fragment 3/4: Chapters...');
  const f3 = await generateFragment(`${langPrompt} Generate a JSON list of 8 "chapterSummaries" for "${title}" by ${author}:
  [
    { "chapter": 1, "title": "Title", "summary": "250 words deep summary covering the chapter's core logic", "keyTakeaway": "One sentence takeaway" }
  ]`, `${title} [${language}] Chapters`);

  console.log('   🔸 Fragment 4/4: Quotes & Plans...');
  const f4 = await generateFragment(`${langPrompt} Generate a JSON object for "${title}" by ${author}:
  {
    "memorableQuotes": [{ "quote": "Quote string", "context": "Where in book", "significance": "Why it matters" }],
    "actionPlan": [{ "action": "Step to take", "difficulty": "easy|medium|hard", "timeframe": "immediate|short-term", "outcome": "benefit" }]
  }`, `${title} [${language}] Quotes`);

  const book = await prisma.book.findFirst({
    where: { 
      OR: [
        { title, language },
        { originalTitle: title, language }
      ]
    }
  });

  if (book) {
    await prisma.book.update({
      where: { id: book.id },
      data: {
        summary: `${f1.bigIdea}\n\n${f1.whyItMatters}`,
        keyInsights: f2.map((i: any) => ({
          title: i.title,
          description: `${i.explanation} ${i.example} ${i.impact}`
        })),
        chapters: f3.map((ch: any) => ({
          number: ch.chapter,
          title: ch.title,
          summary: ch.summary
        })),
        quotes: (f4.memorableQuotes || []).map((q: any) => q.quote),
        actionItems: (f4.actionPlan || []).map((a: any) => a.action)
      }
    });
    console.log(`   ✅ Success! Full expansion saved to database.`);
  } else {
    console.log(`   ⚠️ Book not found in DB: "${title}" [${language}]`);
  }
}

async function startProject() {
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const title of SHORT_BOOK_TITLES) {
    const ref = await prisma.book.findFirst({ where: { title, language: 'en' } });
    if (!ref) {
      console.log(`⚠️ Reference book not found: "${title}"`);
      continue;
    }
    
    for (const lang of ['en', 'de'] as const) {
      const existing = await prisma.book.findFirst({
        where: { 
          OR: [
            { title, language: lang },
            { originalTitle: title, language: lang }
          ]
        }
      });

      const isFallback = existing?.summary?.includes('transformative guide') && existing?.summary?.includes('conventional thinking');
      
      const summaryWords = existing?.summary?.split(/\s+/).length || 0;
      const insightWords = JSON.stringify(existing?.keyInsights || []).split(/\s+/).length || 0;
      const totalWords = summaryWords + insightWords;

      if (existing && totalWords > 1500 && !isFallback) {
        console.log(`⏩ Skipping: "${title}" [${lang.toUpperCase()}] already expanded (${totalWords} words).`);
        skipped++;
        continue;
      }

      try {
        await expandBookFragmented(title, ref.author, lang);
        processed++;
        console.log(`⏳ Waiting 90s between books (processed ${processed} so far)...`);
        await new Promise(r => setTimeout(r, 90000));
      } catch (e: any) {
        console.error(`❌ SKIPPING "${title}" [${lang}]: ${e.message}`);
        failed++;
        // Wait extra long after a failure
        console.log('⏳ Waiting 120s after failure...');
        await new Promise(r => setTimeout(r, 120000));
      }
    }
  }

  console.log(`\n🏁 Done! Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);
}

startProject()
  .catch(e => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
