
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: npx tsx test-book-details.ts <id>');
    process.exit(1);
  }
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    console.log('Book not found.');
    return;
  }
  
  let totalText = (book.summary || '');
  if (Array.isArray(book.keyInsights)) {
    (book.keyInsights as any[]).forEach(ki => {
      totalText += ' ' + (ki.title || '') + ' ' + (ki.description || '');
    });
  }
  if (Array.isArray(book.chapters)) {
    (book.chapters as any[]).forEach(ch => {
      totalText += ' ' + (ch.title || '') + ' ' + (ch.summary || '');
    });
  }
  if (Array.isArray(book.quotes)) {
    totalText += ' ' + (book.quotes as string[]).join(' ');
  }
  if (Array.isArray(book.actionItems)) {
    totalText += ' ' + (book.actionItems as string[]).join(' ');
  }

  const words = totalText.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`\nBOOK DETAILS:`);
  console.log(`ID: ${book.id}`);
  console.log(`Title: ${book.title}`);
  console.log(`Language: ${book.language}`);
  console.log(`Author: ${book.author}`);
  console.log(`Word Count (Total): ${words}`);
  console.log(`Summary Words: ${book.summary?.split(/\s+/).length || 0}`);
  console.log(`Key Insights count: ${(book.keyInsights as any[])?.length || 0}`);
  console.log(`Chapters count: ${(book.chapters as any[])?.length || 0}`);
}

main().finally(() => prisma.$disconnect());
