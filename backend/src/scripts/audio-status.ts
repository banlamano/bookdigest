/**
 * Quick one-shot: report audio status across the catalog.
 *   npx tsx src/scripts/audio-status.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const listMode = process.argv.includes('--list');

  if (listMode) {
    const books = await prisma.book.findMany({
      where: { audioRegeneratedAt: { not: null } },
      select: { title: true, language: true, audioRegeneratedAt: true },
      orderBy: [{ audioRegeneratedAt: 'asc' }, { title: 'asc' }],
    });
    console.log(`📚 ${books.length} books with full-content audio:\n`);
    for (const b of books) {
      const d = b.audioRegeneratedAt
        ? b.audioRegeneratedAt.toISOString().slice(0, 10)
        : '';
      console.log(`  [${b.language}] ${d}  ${b.title}`);
    }
    await prisma.$disconnect();
    return;
  }

  const total = await prisma.book.count();
  const withAudio = await prisma.book.count({
    where: { audioUrl: { not: null } },
  });
  const fullContent = await prisma.book.count({
    where: { audioRegeneratedAt: { not: null } },
  });
  const summaryOnly = await prisma.book.count({
    where: { AND: [{ audioUrl: { not: null } }, { audioRegeneratedAt: null }] },
  });
  const noAudio = await prisma.book.count({
    where: { audioUrl: null },
  });

  const byLang = await prisma.book.groupBy({
    by: ['language'],
    _count: true,
  });
  const fullByLang = await prisma.book.groupBy({
    by: ['language'],
    where: { audioRegeneratedAt: { not: null } },
    _count: true,
  });

  console.log('📊 Audio status\n');
  console.log(`  Total books:            ${total}`);
  console.log(`  Any audio at all:       ${withAudio}`);
  console.log(`  Full-content audio:     ${fullContent}`);
  console.log(`  Summary-only audio:     ${summaryOnly}`);
  console.log(`  No audio yet:           ${noAudio}\n`);

  console.log('  By language:');
  for (const row of byLang) {
    const full = fullByLang.find(f => f.language === row.language)?._count ?? 0;
    console.log(`    ${row.language}: ${full}/${row._count} full-content`);
  }

  console.log(`\n  At 30/month, remaining ${total - fullContent} books = ~${Math.ceil((total - fullContent) / 30)} months`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
