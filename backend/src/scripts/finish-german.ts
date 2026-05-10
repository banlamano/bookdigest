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
  { id: '8232030c-51bf-4929-88bf-07544d46bf7d', title: 'The Giver of Stars' },
  { id: 'b00c5742-1f8a-45b7-9736-3814b8da0ade', title: 'A Wealth of Common Sense' },
  { id: '154254d5-2451-4f93-9b72-ed1d2a24b59a', title: 'Incognito' },
  { id: 'ebb97cf9-e2a4-4a46-9b8e-a8c26197b1b6', title: 'The Four Agreements' },
  { id: 'ccabac0f-6caa-414a-b8af-f946ac91899f', title: 'So Good They Can\'t Ignore You' },
  { id: '1886fa68-b218-4004-ad13-5863dfa8a57b', title: 'Man\'s Search for Meaning' },
  { id: 'cef66c60-9179-4ea2-bc2b-244b20414d88', title: 'The Alchemist' },
  { id: 'a0c92a72-8a72-4670-bf6d-cddbd4503baa', title: 'The Subtle Art of Not Giving a F*ck' },
];

async function expandBook(id: string, title: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

  // Use analytical prompt to avoid recitation blocks
  const prompt = `Du bist ein erfahrener Literaturkritiker. Erstelle eine DETAILLIERTE ANALYTISCHE Zusammenfassung auf DEUTSCH für das Buch "${title}".

WICHTIG: Zitiere NICHT direkt aus dem Buch. Verwende stattdessen deine eigene analytische Perspektive und Interpretation.

Antworte ausschließlich mit gültigem JSON in folgendem Format:
{
  "summary": "Eine ausführliche analytische Zusammenfassung (mindestens 600 Wörter). Analysiere Themen, Argumente und Bedeutung des Buches.",
  "keyInsights": [
    {"title": "Titel der Erkenntnis", "explanation": "Detaillierte Erklärung (mind. 100 Wörter)", "example": "Konkretes Beispiel", "impact": "Praktische Auswirkung"}
  ],
  "chapters": [
    {"number": 1, "title": "Kapiteltitel", "summary": "Zusammenfassung (mind. 80 Wörter)"}
  ],
  "quotes": ["Thematisch passende Weisheit 1", "Thematisch passende Weisheit 2"],
  "actionItems": ["Handlungsempfehlung 1", "Handlungsempfehlung 2"]
}

Anforderungen:
- summary: mindestens 600 Wörter, analytisch und spezifisch
- 8-10 keyInsights mit ausführlichen Erklärungen
- 8-10 chapters mit detaillierten Zusammenfassungen
- 8 quotes (thematisch passend, KEINE direkten Zitate)
- 8 actionItems
- Alles auf DEUTSCH
- Nur gültiges JSON zurückgeben, NICHTS anderes`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);

    await prisma.book.update({
      where: { id },
      data: {
        summary: data.summary || '',
        keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
        chapters: Array.isArray(data.chapters) ? data.chapters : [],
        quotes: Array.isArray(data.quotes) ? data.quotes : [],
        actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      }
    });
    console.log(`✅ ${title} (DE) — ${(data.summary || '').split(/\s+/).length}w`);
    return true;
  } catch (err: any) {
    console.log(`❌ ${title} (DE) — ${err.message?.substring(0, 80)}`);
    return false;
  }
}

async function main() {
  console.log(`\n🇩🇪 Expanding ${targetBooks.length} German books...\n`);

  for (const book of targetBooks) {
    await expandBook(book.id, book.title);
    // Small delay between calls
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Done!');
}

main().finally(() => prisma.$disconnect());
