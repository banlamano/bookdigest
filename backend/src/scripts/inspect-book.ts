
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const title = process.argv[2];
const lang = process.argv[3];

async function inspect() {
  const book = await prisma.book.findFirst({
    where: { 
      OR: [
        { title, language: lang },
        { originalTitle: title, language: lang }
      ]
    }
  });

  if (!book) {
    console.log(`Book "${title}" [${lang}] not found.`);
    return;
  }

  const s = book.summary || "";
  const wc = s.split(/\s+/).length;
  console.log(`Book: ${book.title} [${book.language}]`);
  console.log(`Summary Status: ${wc < 800 ? "Short" : wc < 1500 ? "Good" : "Premium"}`);
  console.log(`Summary Words: ${wc}`);
  console.log(`Summary Length Chars: ${s.length}`);
  console.log(`Summary Start: ${s.substring(0, 300)}...`);
}

inspect().finally(() => prisma.$disconnect());
