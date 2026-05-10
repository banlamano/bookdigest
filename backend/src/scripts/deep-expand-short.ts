
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function generateFragment(prompt: string, label: string): Promise<any> {
  let attempts = 0;
  const MAX_ATTEMPTS = 15;
  while (attempts < MAX_ATTEMPTS) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      console.log(`   ✔ ${label} succeeded. Waiting 10s...`);
      await new Promise(r => setTimeout(r, 10000));
      return data;
    } catch (e: any) {
      attempts++;
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        const wait = 60 * attempts;
        console.log(`   ⚠️ Rate limited (429) attempt ${attempts}/${MAX_ATTEMPTS}. Waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else if (e instanceof SyntaxError) {
        console.log(`   ⚠️ JSON parse error attempt ${attempts}/${MAX_ATTEMPTS}. Retrying...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error(`   ❌ Unexpected error: ${e.message}`);
        if (attempts >= 3) throw e;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  throw new Error(`Failed after ${MAX_ATTEMPTS} attempts for: ${label}`);
}

async function expandBook(bookId: string, title: string, author: string, language: 'en' | 'de') {
  console.log(`\n📚 [${language.toUpperCase()}] Deep Expansion: "${title}"`);
  
  const langPrompt = language === 'de' ? 'IMPORTANT: Answer ONLY in GERMAN. All text must be in German.' : 'Answer ONLY in English.';

  // Fragment 1: Deep Summary (target 800-1000 words)
  console.log('   🔸 Fragment 1/4: Deep Summary...');
  const f1 = await generateFragment(`${langPrompt}
You are a literary expert writing for a book digest website. Generate a JSON object for the book "${title}" by ${author}.
The summary must be EXTREMELY DETAILED — at least 800 words. Include:
- A comprehensive overview of the plot/content (400 words)
- A "Why It Matters" section explaining the book's significance and relevance (200 words)  
- A "Final Takeaway" with the core lesson (200 words)

Return ONLY this JSON:
{
  "summary": "Your 800+ word summary here. Use \\n\\n for paragraph breaks. Include ### Why It Matters and ### The Final Takeaway as markdown headers within the text."
}`, `${title} [${language}] Summary`);

  // Fragment 2: 5-8 Key Insights (target 600-800 words total)
  console.log('   🔸 Fragment 2/4: Key Insights...');
  const f2 = await generateFragment(`${langPrompt}
You are a literary expert. Generate a JSON array of 5 to 8 detailed "keyInsights" for the book "${title}" by ${author}.
Each insight must have a DETAILED explanation of 4-6 sentences (80-100 words each).

Return ONLY a JSON array:
[
  {
    "title": "Insight Title",
    "explanation": "4-6 sentences deep explanation of this insight and why it matters (80-100 words minimum)",
    "example": "A specific, concrete example from the book illustrating this insight (2-3 sentences)",
    "impact": "How this insight can change the reader's life or perspective (1-2 sentences)"
  }
]`, `${title} [${language}] Insights`);

  // Fragment 3: 6-10 Chapters with detailed summaries (target 800-1200 words total)
  console.log('   🔸 Fragment 3/4: Chapter Summaries...');
  const f3 = await generateFragment(`${langPrompt}
You are a literary expert. Generate a JSON array of 6 to 10 detailed chapter summaries for the book "${title}" by ${author}.
Each chapter summary must be a DETAILED PARAGRAPH of 100-200 words covering the chapter's core content, key events, arguments, and significance.
Do NOT write one-sentence summaries. Each must be a full, rich paragraph.

Return ONLY a JSON array:
[
  {
    "number": 1,
    "title": "Chapter Title",
    "summary": "A detailed 100-200 word paragraph summarizing this chapter's content, key events or arguments, character development, and significance to the overall narrative."
  }
]`, `${title} [${language}] Chapters`);

  // Fragment 4: Quotes & Action Items
  console.log('   🔸 Fragment 4/4: Quotes & Actions...');
  const f4 = await generateFragment(`${langPrompt}
You are a literary expert. Generate a JSON object for the book "${title}" by ${author} with memorable quotes and actionable takeaways.

Return ONLY this JSON:
{
  "quotes": ["Quote 1", "Quote 2", "Quote 3", "Quote 4", "Quote 5"],
  "actionItems": [
    "Detailed action item 1 the reader can implement (1-2 sentences)",
    "Detailed action item 2 (1-2 sentences)",
    "Detailed action item 3 (1-2 sentences)",
    "Detailed action item 4 (1-2 sentences)"
  ]
}`, `${title} [${language}] Quotes`);

  // Save to database
  await prisma.book.update({
    where: { id: bookId },
    data: {
      summary: f1.summary,
      keyInsights: f2.map((i: any) => ({
        title: i.title,
        explanation: i.explanation,
        example: i.example || '',
        impact: i.impact || ''
      })),
      chapters: f3.map((ch: any) => ({
        number: ch.number,
        title: ch.title,
        summary: ch.summary
      })),
      quotes: f4.quotes || [],
      actionItems: f4.actionItems || []
    }
  });
  console.log(`   ✅ Saved! Full deep expansion for "${title}" [${language}].`);
}

async function main() {
  // Find all short books (< 800 words total content)
  const allBooks = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      originalTitle: true,
      language: true,
      author: true,
      summary: true,
      keyInsights: true,
      chapters: true,
      quotes: true,
      actionItems: true,
    }
  });

  const shortBooks: any[] = [];

  for (const book of allBooks) {
    let totalText = (book.summary || '');
    if (Array.isArray(book.keyInsights)) {
      (book.keyInsights as any[]).forEach(ki => {
        totalText += ' ' + (ki.explanation || '') + ' ' + (ki.title || '') + ' ' + (ki.example || '') + ' ' + (ki.impact || '');
      });
    }
    if (Array.isArray(book.chapters)) {
      (book.chapters as any[]).forEach(ch => {
        totalText += ' ' + (ch.summary || '') + ' ' + (ch.title || '');
      });
    }
    if (Array.isArray(book.quotes)) {
      totalText += ' ' + (book.quotes as string[]).join(' ');
    }
    if (Array.isArray(book.actionItems)) {
      totalText += ' ' + (book.actionItems as string[]).join(' ');
    }
    const wordCount = totalText.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 800) {
      shortBooks.push({
        id: book.id,
        title: book.title,
        originalTitle: book.originalTitle,
        language: book.language,
        author: book.author,
        words: wordCount
      });
    }
  }

  // Sort by word count ascending (shortest first)
  shortBooks.sort((a, b) => a.words - b.words);

  console.log(`\n🎯 Found ${shortBooks.length} short books to expand.\n`);
  shortBooks.forEach(b => console.log(`  - ${b.title} [${b.language}]: ${b.words} words`));
  console.log('');

  let processed = 0;
  let failed = 0;

  for (const book of shortBooks) {
    const lookupTitle = book.originalTitle || book.title;
    try {
      await expandBook(book.id, lookupTitle, book.author, book.language as 'en' | 'de');
      processed++;
      console.log(`⏳ Progress: ${processed}/${shortBooks.length}. Waiting 15s between books...`);
      await new Promise(r => setTimeout(r, 15000));
    } catch (e: any) {
      console.error(`❌ FAILED "${book.title}" [${book.language}]: ${e.message}`);
      failed++;
      console.log('⏳ Waiting 60s after failure...');
      await new Promise(r => setTimeout(r, 60000));
    }
  }

  console.log(`\n🏁 Done! Processed: ${processed}, Failed: ${failed}, Total Short: ${shortBooks.length}`);
}

main()
  .catch(e => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
