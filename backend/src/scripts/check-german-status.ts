import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.book.count({ where: { language: 'de' } });

  const realCovers = await prisma.book.count({
    where: {
      language: 'de',
      coverImage: { not: null },
      AND: [
        { coverImage: { not: '' } },
        { coverImage: { not: { contains: '/ai-covers/' } } },
      ],
    },
  });

  const aiCovers = await prisma.book.count({
    where: { language: 'de', coverImage: { contains: '/ai-covers/' } },
  });

  const noCovers = await prisma.book.count({
    where: {
      language: 'de',
      OR: [{ coverImage: null }, { coverImage: '' }],
    },
  });

  console.log('\n🇩🇪 German Book Status');
  console.log('════════════════════════════════');
  console.log(`Total books         : ${total}`);
  console.log(`Real covers (Google): ${realCovers}`);
  console.log(`AI covers (SVG)     : ${aiCovers}`);
  console.log(`No cover            : ${noCovers}`);
  console.log('');

  // Books missing covers entirely
  if (noCovers > 0) {
    const missing = await prisma.book.findMany({
      where: { language: 'de', OR: [{ coverImage: null }, { coverImage: '' }] },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });
    console.log(`⚠️  Books with NO cover (${missing.length}):`);
    missing.forEach(b => console.log(`  [${b.id}] ${b.title}`));
    console.log('');
  }

  // Sample of AI-covered books
  const aiSample = await prisma.book.findMany({
    where: { language: 'de', coverImage: { contains: '/ai-covers/' } },
    select: { title: true, coverImage: true },
    take: 5,
    orderBy: { title: 'asc' },
  });
  if (aiSample.length) {
    console.log(`🎨 Sample AI-covered books:`);
    aiSample.forEach(b => console.log(`  ${b.title.substring(0, 55).padEnd(55)} → ${b.coverImage}`));
    console.log('');
  }

  // Sample of real-covered books
  const realSample = await prisma.book.findMany({
    where: {
      language: 'de',
      coverImage: { not: null },
      AND: [
        { coverImage: { not: '' } },
        { coverImage: { not: { contains: '/ai-covers/' } } },
      ],
    },
    select: { title: true, coverImage: true },
    take: 5,
    orderBy: { title: 'asc' },
  });
  if (realSample.length) {
    console.log(`🖼️  Sample real-covered books:`);
    realSample.forEach(b => console.log(`  ${b.title.substring(0, 55).padEnd(55)} → ${b.coverImage?.substring(0, 60)}`));
  }

  console.log('\n════════════════════════════════');
  if (noCovers === 0 && (realCovers > 0 || aiCovers > 0)) {
    console.log('✅ All German books have a cover.');
  }
  if (realCovers === 0) {
    console.log('💡 No real covers yet. Add GOOGLE_BOOKS_API_KEY to .env and re-run fix-german-titles-covers.ts');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
