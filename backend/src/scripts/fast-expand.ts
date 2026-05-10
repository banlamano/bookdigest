import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

async function fastExpand(title: string, author: string, language: 'en' | 'de') {
  console.log(`\n📚 [${language.toUpperCase()}] Fast Expanding: "${title}"`);
  
  const langPrompt = language === 'de' ? 'IMPORTANT: Answer ONLY in GERMAN.' : 'Answer ONLY in English.';

  const prompt = `${langPrompt} You are an expert book summarizer. Generate a comprehensive, deep-dive summary for the book "${title}" by ${author}.
  
  Create a single JSON response with the following structure (MUST be valid JSON):
  {
    "bigIdea": "Engaging punchy paragraph (150 words)",
    "whyItMatters": "3 paragraphs (400 words) on relevance and research",
    "keyInsights": [
      { "title": "Insight Title", "description": "100 words deep explanation with examples and real-world impact (80-120 words per insight)" }
    ],
    "chapters": [
      { "number": 1, "title": "Title", "summary": "150 words covering main argument, evidence, and practical application. Write with depth." }
    ],
    "quotes": ["Five powerful, representative quotes from the book"],
    "actionItems": ["Seven specific, actionable steps readers can take"]
  }

  LENGTH TARGETS: 
  - 8-10 keyInsights (min 800 words total for insights)
  - 6-8 chapters (min 900 words total for chapters)
  - Total output should exceed 1,500 words. 
  - Content must be specific to this book, NOT generic. Skip templates.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const finalJSON = JSON.parse(cleaned);

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
          summary: `${finalJSON.bigIdea}\n\n${finalJSON.whyItMatters}`,
          keyInsights: JSON.stringify(finalJSON.keyInsights.map((i: any) => ({
            title: i.title,
            description: i.description
          }))),
          chapters: JSON.stringify(finalJSON.chapters.map((ch: any) => ({
            number: ch.number,
            title: ch.title,
            summary: ch.summary
          }))),
          quotes: JSON.stringify(finalJSON.quotes || []),
          actionItems: JSON.stringify(finalJSON.actionItems || [])
        }
      });
      console.log(`   ✅ Success! Saved ~1,500 words of real content.`);
    }
  } catch (e: any) {
    console.error(`   ❌ Failed: ${e.message}`);
  }
}

async function startProject() {
  for (const title of SHORT_BOOK_TITLES) {
    const ref = await prisma.book.findFirst({ where: { title, language: 'en' } });
    if (!ref) continue;
    
    for (const lang of ['en', 'de'] as const) {
      const existing = await prisma.book.findFirst({
        where: { 
          OR: [
            { title, language: lang },
            { originalTitle: title, language: lang }
          ]
        }
      });

      // Skip if already long enough (above 2000 total words)
      let totalWords = 0;
      if (existing) {
        totalWords += (existing.summary || '').split(/\s+/).length;
        try {
          const insights = JSON.parse(existing.keyInsights as string || '[]');
          insights.forEach((i: any) => totalWords += (i.description || '').split(/\s+/).length);
          const chapters = JSON.parse(existing.chapters as string || '[]');
          chapters.forEach((c: any) => totalWords += (c.summary || '').split(/\s+/).length);
        } catch(e) {}
      }

      const isFallback = existing?.summary?.includes('transformative guide') && existing?.summary?.includes('conventional thinking');

      if (totalWords > 2000 && !isFallback) {
         console.log(`   ⏩ Skipping "${title}" [${lang.toUpperCase()}]: Already Premium (${totalWords} words).`);
         continue;
      }

      await fastExpand(title, ref.author, lang);
      // Wait 15s between calls to stay at 4 RPM
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

startProject().catch(e => { console.error('FATAL:', e); process.exit(1); });
