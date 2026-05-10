import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const book: any = await prisma.book.findFirst({
    where: { language: 'en' },
    orderBy: { updatedAt: 'desc' },
  });

  if (!book) return;

  const summaryWords = (book.summary || '').split(/\s+/).length;

  // keyInsights is stored as a Prisma Json field - could be string or object
  let insightWords = 0;
  let insightCount = 0;
  const rawKI = book.keyInsights;
  const kiArray = typeof rawKI === 'string' ? JSON.parse(rawKI) : rawKI;
  if (Array.isArray(kiArray)) {
    insightCount = kiArray.length;
    for (const item of kiArray) {
      insightWords += (item.explanation || '').split(/\s+/).length;
      insightWords += (item.example || '').split(/\s+/).length;
      insightWords += (item.impact || '').split(/\s+/).length;
    }
  }

  let chapterWords = 0;
  let chapterCount = 0;
  const rawCh = book.chapters;
  const chArray = typeof rawCh === 'string' ? JSON.parse(rawCh) : rawCh;
  if (Array.isArray(chArray)) {
    chapterCount = chArray.length;
    for (const item of chArray) {
      chapterWords += (item.summary || '').split(/\s+/).length;
    }
  }

  let quoteCount = 0;
  const rawQ = book.quotes;
  const qArray = typeof rawQ === 'string' ? JSON.parse(rawQ) : rawQ;
  if (Array.isArray(qArray)) quoteCount = qArray.length;

  let actionCount = 0;
  const rawA = book.actionItems;
  const aArray = typeof rawA === 'string' ? JSON.parse(rawA) : rawA;
  if (Array.isArray(aArray)) actionCount = aArray.length;

  const totalWords = summaryWords + insightWords + chapterWords;

  const result = {
    title: book.title,
    updatedAt: book.updatedAt,
    summaryWords,
    insightWords,
    insightCount,
    chapterWords,
    chapterCount,
    quoteCount,
    actionCount,
    totalWords,
    summaryExcerpt: book.summary.substring(0, 300),
    rawKeyInsightsType: typeof rawKI,
    rawChaptersType: typeof rawCh,
  };

  fs.writeFileSync(path.resolve(process.cwd(), 'quality-check.json'), JSON.stringify(result, null, 2), 'utf-8');
}

main().finally(() => prisma.$disconnect());
