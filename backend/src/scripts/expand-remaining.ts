import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Using gemini-2.0-flash as it is the most reliable endpoint despite quota
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function countWords(str: any): number {
  if (typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function tryParseJSON(str: any): any[] {
  if (Array.isArray(str)) return str;
  if (typeof str === 'string') {
    try { return JSON.parse(str); } catch { return []; }
  }
  return [];
}

async function getWordCount(book: any): Promise<number> {
    let count = countWords(book.summary);
    const chs = tryParseJSON(book.chapters);
    chs.forEach((c: any) => { count += countWords(c.title); count += countWords(c.summary); count += countWords(c.keyTakeaway); });
    const kis = tryParseJSON(book.keyInsights);
    kis.forEach((ki: any) => { count += countWords(ki.title); count += countWords(ki.description); count += countWords(ki.explanation); count += countWords(ki.example); count += countWords(ki.impact); });
    const ais = tryParseJSON(book.actionItems);
    ais.forEach((ai: any) => { if (typeof ai === 'string') count += countWords(ai); else { count += countWords(ai?.action); count += countWords(ai?.outcome); } });
    const qs = tryParseJSON(book.quotes);
    qs.forEach((q: any) => { if (typeof q === 'string') count += countWords(q); else { count += countWords(q?.quote); count += countWords(q?.context); count += countWords(q?.significance); } });
    return count;
}

async function generateFragment(prompt: string): Promise<any> {
    let attempts = 0;
    while (attempts < 5) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleaned);
        // Free tier throttle
        console.log('   🔸 Waiting 75s to clear per-minute quota...');
        await new Promise(r => setTimeout(r, 75000));
        return data;
      } catch (e: any) {
        if (e.message.includes('429')) {
           console.log('   ⚠️ Rate limited (429). Waiting 90 seconds...');
           await new Promise(r => setTimeout(r, 90000));
           attempts++;
        } else {
           throw e;
        }
      }
    }
    throw new Error('Failed to generate fragment after 5 retries (rate limits).');
}

async function expandBook(book: any) {
    console.log(`\n📚 Expanding: "${book.title}" [${book.language}]`);
    
    // Fragment 1: Summary Refinement
    const p1 = `As an expert book summarizer, expand and refine the following book summary for "${book.title}" by ${book.author}. 
    Make it detailed, non-generic, and over 500 words. Format as JSON: { "summary": "..." }. 
    Current summary: ${book.summary}`;
    const f1 = await generateFragment(p1);
    
    // Fragment 2: Chapter Expansion
    const p2 = `Expand the following chapters for "${book.title}". Make each chapter summary deep and specific (150+ words per chapter).
    Format as JSON: { "chapters": [ { "title": "...", "summary": "...", "keyTakeaway": "..." } ] }.
    Current chapters: ${JSON.stringify(book.chapters)}`;
    const f2 = await generateFragment(p2);
    
    // Fragment 3: Key Insights Expansion
    const p3 = `Expand the following key insights for "${book.title}". Make each explanation and example detailed and premium.
    Format as JSON: { "keyInsights": [ { "title": "...", "description": "...", "explanation": "...", "example": "...", "impact": "..." } ] }.
    Current insights: ${JSON.stringify(book.keyInsights)}`;
    const f3 = await generateFragment(p3);
    
    // Fragment 4: Action Items & Quotes
    const p4 = `Expand the list of action items and quotes for "${book.title}".
    Format as JSON: { "actionItems": [ { "action": "...", "outcome": "..." } ], "quotes": [ { "quote": "...", "context": "...", "significance": "..." } ] }.
    Current action items: ${JSON.stringify(book.actionItems)}
    Current quotes: ${JSON.stringify(book.quotes)}`;
    const f4 = await generateFragment(p4);

    await prisma.book.update({
        where: { id: book.id },
        data: {
            summary: f1.summary,
            chapters: JSON.stringify(f2.chapters),
            keyInsights: JSON.stringify(f3.keyInsights),
            actionItems: JSON.stringify(f4.actionItems),
            quotes: JSON.stringify(f4.quotes)
        }
    });

    console.log(`   ✅ "${book.title}" successfully expanded!`);
}

async function main() {
    console.log('🚀 Starting AUTOMATIC Premium Expansion Scan...');
    
    const allBooks = await prisma.book.findMany({ select: { id: true, title: true, author: true, language: true, summary: true, chapters: true, keyInsights: true, actionItems: true, quotes: true } });
    const shortBooks = [];
    
    for (const book of allBooks) {
        const count = await getWordCount(book);
        if (count < 1500) {
            shortBooks.push({ ...book, count });
        }
    }
    
    console.log(`🔍 Found ${shortBooks.length} books below 1500 word target.`);
    
    for (const book of shortBooks) {
        try {
            await expandBook(book);
            // Long wait between books to protect daily limit
            console.log('⏳ Waiting 120s between books for daily quota safety...');
            await new Promise(r => setTimeout(r, 120000));
        } catch (e: any) {
            console.error(`❌ Fatal error on "${book.title}":`, e.message);
            if (e.message.includes('429')) {
                console.log('🛑 Daily limit likely reached. Stopping script.');
                break;
            }
        }
    }

    await prisma.$disconnect();
}

main();
