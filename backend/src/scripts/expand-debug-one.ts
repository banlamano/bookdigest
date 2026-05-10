import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

async function generateFragment(prompt: string): Promise<any> {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      console.error('   ❌ ERROR in generateFragment:', e.message);
      throw e;
    }
}

async function main() {
  const title = 'Grit';
  const author = 'Angela Duckworth';
  const language = 'en';
  
  console.log(`🚀 DEBUG EXPANSION: "${title}" [${language}]`);

  const f1 = await generateFragment(`Answer ONLY in English. Generate a JSON object for the book "${title}" by ${author}:
  {
    "bigIdea": "Punchy paragraph (100 words)",
    "whyItMatters": "3 paragraphs (300 words) on relevance and target audience",
    "finalTakeaway": "One powerful summary paragraph",
    "targetAudience": ["Person 1", "Person 2", "Person 3"]
  }`);
  console.log('   ✅ Got Fragment 1');

  const f2 = await generateFragment(`Answer ONLY in English. Generate a JSON list of 10 "keyInsights" for "${title}" by ${author}:
  [
    { "title": "Insight Title", "explanation": "4-6 sentences deep explanation", "example": "Real-world example", "impact": "Life impact" }
  ]`);
  console.log('   ✅ Got Fragment 2');

  const f3 = await generateFragment(`Answer ONLY in English. Generate a JSON list of 8 "chapterSummaries" for "${title}" by ${author}:
  [
    { "chapter": 1, "title": "Title", "summary": "250 words deep summary covering the chapter's core logic", "keyTakeaway": "One sentence takeaway" }
  ]`);
  console.log('   ✅ Got Fragment 3');

  const f4 = await generateFragment(`Answer ONLY in English. Generate a JSON object for "${title}" by ${author}:
  {
    "memorableQuotes": [{ "quote": "Quote string", "context": "Where in book", "significance": "Why it matters" }],
    "actionPlan": [{ "action": "Step to take", "difficulty": "easy|medium|hard", "timeframe": "immediate|short-term", "outcome": "benefit" }]
  }`);
  console.log('   ✅ Got Fragment 4');

  await prisma.book.findFirst({ where: { title, language } }).then(async book => {
    if (book) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          summary: `${f1.bigIdea}\n\n${f1.whyItMatters}`,
          keyInsights: JSON.stringify(f2.map((i: any) => ({
            title: i.title,
            description: `${i.explanation} ${i.example} ${i.impact}`
          }))),
          chapters: JSON.stringify(f3.map((ch: any) => ({
            number: ch.chapter,
            title: ch.title,
            summary: ch.summary
          })))
        }
      });
      console.log('   ✅ DATABASE UPDATED');
    }
  });

  process.exit(0);
}

main().catch(e => { console.error('FATAL ERROR:', e); process.exit(1); });
