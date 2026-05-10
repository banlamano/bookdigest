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
  "A Wealth of Common Sense",
  "The Giver of Stars",
  "So Good They Can't Ignore You"
];

async function expandChapters(title: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

  const prompt = `Erstelle eine sehr ausführliche KAPITEL-ZUSAMMENFASSUNG auf DEUTSCH für das Buch "${title}".
Dieses Mal interessieren mich AUSSCHLIESSLICH die detaillierten Kapitel! Jedes Kapitel MUSS eine sehr lange und detaillierte Zusammenfassung (mindestens 100-150 Wörter pro Kapitel) haben. Zitiere nicht direkt, sondern erkläre ausführlich mit eigenen Worten.

Antworte ausschließlich mit gültigem JSON (ohne Markdown) in folgendem Format:
{
  "chapters": [
    {
      "number": 1,
      "title": "Vollständiger Kapiteltitel",
      "summary": "Extrem detaillierte, lange Zusammenfassung des Kapitels (mindestens 100-150 Wörter)."
    }
  ]
}

Anforderungen:
- Schreibe für jedes Kapitel (mindestens 8-10 Kapitel) eine SEHR LANGE Zusammenfassung.
- Nur gültiges JSON zurückgeben.`;

  try {
    const book = await prisma.book.findFirst({
        where: { title, language: 'de' }
    });
    
    if (!book) return;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);

    if (Array.isArray(data.chapters) && data.chapters.length > 0) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          chapters: data.chapters,
        }
      });
      console.log(`✅ ${title} (DE) — updated ${data.chapters.length} chapters.`);
      
      // Check average length of new chapters
      let words = 0;
      data.chapters.forEach((c: any) => words += (c.summary || '').split(/\s+/).length);
      console.log(`   Avg: ${Math.round(words / data.chapters.length)} words per chapter.`);
    }

    return true;
  } catch (err: any) {
    console.log(`❌ ${title} (DE) — Error: ${err.message?.substring(0, 80)}`);
    return false;
  }
}

async function main() {
  console.log(`\n🇩🇪 Expanding chapters for the 3 books...\n`);

  for (const title of targetBooks) {
    await expandChapters(title);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\n✅ All Done!');
}

main().finally(() => prisma.$disconnect());
