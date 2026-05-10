import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find a book with a LONG summary (over 1000 words) to use as reference
  const books = await prisma.book.findMany({
    where: { language: 'en' },
    select: { title: true, summary: true, keyInsights: true, chapters: true, quotes: true, actionItems: true }
  });

  const longBooks = books
    .map(b => ({
      ...b,
      words: (b.summary || '').trim().split(/\s+/).length,
      insightCount: Array.isArray(b.keyInsights) ? (b.keyInsights as any[]).length : 0,
      chapterCount: Array.isArray(b.chapters) ? (b.chapters as any[]).length : 0,
    }))
    .filter(b => b.words >= 1000)
    .sort((a, b) => b.words - a.words);

  console.log(`Books with summaries >= 1000 words: ${longBooks.length}`);
  console.log('\nTop 5 longest:');
  for (const b of longBooks.slice(0, 5)) {
    console.log(`  [${b.words}w] ${b.title} (${b.insightCount} insights, ${b.chapterCount} chapters)`);
  }

  // Show one full example
  if (longBooks.length > 0) {
    const sample = longBooks[0];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SAMPLE: "${sample.title}" (${sample.words} words)`);
    console.log(`${'='.repeat(60)}`);
    console.log('\n--- SUMMARY (first 500 chars) ---');
    console.log(sample.summary?.substring(0, 500));
    console.log('\n--- KEY INSIGHTS (first 2) ---');
    const insights = sample.keyInsights as any[];
    if (insights?.length) {
      console.log(JSON.stringify(insights.slice(0, 2), null, 2));
    }
    console.log('\n--- CHAPTERS (first 2) ---');
    const chapters = sample.chapters as any[];
    if (chapters?.length) {
      console.log(JSON.stringify(chapters.slice(0, 2), null, 2));
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
