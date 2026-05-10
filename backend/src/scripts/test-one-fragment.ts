import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

async function main() {
  const title = 'Grit';
  const author = 'Angela Duckworth';
  const language = 'en';
  const langPrompt = 'Answer ONLY in English.';

  console.log(`Testing Fragment 1 for: "${title}"`);
  
  const prompt = `${langPrompt} Generate a JSON object for the book "${title}" by ${author}:
  {
    "bigIdea": "Punchy paragraph (100 words)",
    "whyItMatters": "3 paragraphs (300 words) on relevance and target audience",
    "finalTakeaway": "One powerful summary paragraph",
    "targetAudience": ["Person 1", "Person 2", "Person 3"]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Raw text:', text);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    console.log('✅ Success! Big Idea length:', parsed.bigIdea.length);
  } catch (e: any) {
    console.error('❌ FAILED:', e.message);
  }
}

main().catch(console.error);
