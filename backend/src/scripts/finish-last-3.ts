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

// The 3 remaining short German books
const targetBooks = [
  { title: "A Wealth of Common Sense" },
  { title: "The Giver of Stars" },
  { title: "So Good They Can't Ignore You" }
];

async function expandBook(title: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

  // Use a more aggressive prompt to force length
  const prompt = `Du bist ein erstklassiger Buch-Analyst.
Erstelle eine EXTREM DETAILLIERTE, UMFASSENDE Zusammenfassung auf DEUTSCH für das Buch "${title}".

WICHTIG: Zitiere nicht direkt, sondern erkläre ausführlich mit eigenen Worten. 
FOKUSSIERE DICH DARAUF, SEHR LANG ZU SCHREIBEN (mindestens 800 - 1000 Wörter für die Summary).

Gib NUR gültiges JSON in folgendem Format zurück, ohne Markdown, ohne andere Zeichen:
{
  "summary": "Sehr ausführliche, detaillierte analytische Zusammenfassung (mindestens 800 Wörter).",
  "keyInsights": [
    {"title": "Erkenntnis", "explanation": "Ausführliche Erklärung", "example": "Ausführliches Beispiel", "impact": "Konkrete Auswirkung"}
  ],
  "chapters": [
    {"number": 1, "title": "Titel", "summary": "Ausführliche Kapitelzusammenfassung"}
  ],
  "quotes": ["Lehrreiches Zitat ohne direkten Buchbezug 1", "Zitat 2"],
  "actionItems": ["Handlungsempfehlung 1", "Handlungsempfehlung 2"]
}

Anforderungen:
- summary: ZWINGEND über 800 Wörter.
- keyInsights: 10 detaillierte Insights.
- chapters: 10 detaillierte Kapitel
- quotes: 10 weise Quotes
- actionItems: 8 Handlungsanweisungen
- Alles auf DEUTSCH.
- Nur JSON.`;

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
  console.log(`\n🇩🇪 Expanding the 3 remaining short German books...\n`);

  for (const book of targetBooks) {
    await expandBook(book.title);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Done!');
}

main().finally(() => prisma.$disconnect());
