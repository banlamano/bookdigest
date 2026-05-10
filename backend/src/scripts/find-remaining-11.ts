import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Load progress file to see which are completed
  const progress = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'expand-progress.json'), 'utf-8'));
  const completedIds = new Set(progress.completed || []);

  // Get ALL books
  const allBooks = await prisma.book.findMany({
    select: { id: true, title: true, language: true, summary: true }
  });

  // Find books NOT in completed list
  const notCompleted = allBooks
    .filter(b => !completedIds.has(b.id))
    .map(b => ({
      id: b.id,
      title: b.title,
      language: b.language,
      summaryWords: (b.summary || '').split(/\s+/).length
    }));

  fs.writeFileSync(
    path.resolve(process.cwd(), 'remaining-11.json'),
    JSON.stringify({ count: notCompleted.length, books: notCompleted }, null, 2),
    'utf-8'
  );
  console.log(`Found ${notCompleted.length} books not in completed list`);
}

main().finally(() => prisma.$disconnect());
