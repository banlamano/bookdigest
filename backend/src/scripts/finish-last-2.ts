import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const targetBooks = [
  { title: "A Wealth of Common Sense" },
  { title: "So Good They Can't Ignore You" }
];

async function expandBook(title: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

  const prompt = `Du bist ein Literaturkritiker. Erstelle eine detaillierte Zusammenfassung auf DEUTSCH für das Buch "${title}".
Antworte ausschließlich mit gültigem JSON in folgendem Format:
{
  "summary": "Analytische Zusammenfassung (mindestens 600 Wörter).",
  "keyInsights": [
    {"title": "Titel", "explanation": "Erklärung", "example": "Beispiel", "impact": "Auswirkung"}
  ],
  "chapters": [
    {"number": 1, "title": "Titel", "summary": "Zusammenfassung"}
  ],
  "quotes": ["Zitat 1", "Zitat 2"],
  "actionItems": ["Handlungsempfehlung 1", "Handlungsempfehlung 2"]
}

Anforderungen:
- summary: > 600 Wörter.
- 8 keyInsights 
- 8 chapters
- 8 quotes
- 8 actionItems
Nur gültiges JSON (beginnend mit { und endend mit }).`;

  try {
    const book = await prisma.book.findFirst({
        where: { title, language: 'de' }
    });
    
    if (!book) return;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);

    await prisma.book.update({
      where: { id: book.id },
      data: {
        summary: data.summary || '',
        keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
        chapters: Array.isArray(data.chapters) ? data.chapters : [],
        quotes: Array.isArray(data.quotes) ? data.quotes : [],
        actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      }
    });
    console.log(`✅ ${title} (DE) — ${(data.summary || '').split(/\s+/).length} Wörter`);
    return true;
  } catch (err: any) {
    console.log(`❌ ${title} (DE) — ${err.message?.substring(0, 80)}`);
    return false;
  }
}

async function main() {
  for (const book of targetBooks) {
    await expandBook(book.title);
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().finally(() => prisma.$disconnect());
