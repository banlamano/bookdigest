import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, originalTitle: true, author: true }
  });

  const englishTitles = books.filter(b => b.title === b.originalTitle);
  console.log(JSON.stringify(englishTitles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
