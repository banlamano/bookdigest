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
  "The Giver of Stars",
  "A Wealth of Common Sense"
];

async function expandInsights(title: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

  const prompt = `Erstelle 8 sehr ausführliche "Key Insights" (Erkenntnisse) auf DEUTSCH für das Buch "${title}".
Jedes Insight MUSS eine umfangreiche und detaillierte Erklärung haben (mindestens 80 Wörter pro Erklärung).

Antworte ausschließlich mit gültigem JSON (ohne Markdown) in folgendem Format:
{
  "keyInsights": [
    {
      "title": "Titel des Insights",
      "explanation": "Extrem lange und detaillierte Erklärung der Erkenntnis...",
      "example": "Ein langes und konkretes Beispiel dazu...",
      "impact": "Eine deutliche Auswirkung dieser Erkenntnis auf den Leser..."
    }
  ]
}

Anforderungen:
- 8 detaillierte Key Insights.
- Jede "explanation" MUSS ausführlich sein.
- Nur JSON-Format.`;

  try {
    const book = await prisma.book.findFirst({
        where: { title, language: 'de' }
    });
    
    if (!book) return;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);

    if (Array.isArray(data.keyInsights) && data.keyInsights.length > 0) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          keyInsights: data.keyInsights,
        }
      });
      console.log(`✅ ${title} (DE) — updated ${data.keyInsights.length} key insights.`);
    }

    return true;
  } catch (err: any) {
    console.log(`❌ ${title} (DE) — Error: ${err.message?.substring(0, 80)}`);
    return false;
  }
}

async function main() {
  console.log(`\n🇩🇪 Expanding key insights for the short books...\n`);

  for (const title of targetBooks) {
    await expandInsights(title);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\n✅ All Done!');
}

main().finally(() => prisma.$disconnect());
