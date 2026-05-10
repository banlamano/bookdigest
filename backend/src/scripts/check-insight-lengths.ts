import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { id: true, title: true, keyInsights: true }
  });

  const shortInsightsList: any[] = [];
  let totalInsightsChecked = 0;

  for (const book of books) {
    if (!book.keyInsights) continue;
    
    let kArray: any[] = [];
    if (typeof book.keyInsights === 'string') {
      try {
        kArray = JSON.parse(book.keyInsights);
      } catch (e) {
        continue;
      }
    } else {
      kArray = book.keyInsights as any[];
    }
    
    if (Array.isArray(kArray) && kArray.length > 0) {
      let totalWordsInInsights = 0;
      let veryShortInsightsCount = 0;

      for (const ki of kArray) {
        if (ki && ki.explanation) {
          const wordCount = ki.explanation.trim().split(/\s+/).length;
          totalWordsInInsights += wordCount;
          if (wordCount < 40) { 
            veryShortInsightsCount++;
          }
        }
      }
      
      const avgWordsPerInsight = totalWordsInInsights / kArray.length;
      totalInsightsChecked += kArray.length;

      if (avgWordsPerInsight < 50) {
        shortInsightsList.push({
          id: book.id,
          title: book.title,
          avgWordsPerInsight: Math.round(avgWordsPerInsight),
          totalInsights: kArray.length,
          veryShortInsights: veryShortInsightsCount
        });
      }
    }
  }

  shortInsightsList.sort((a, b) => a.avgWordsPerInsight - b.avgWordsPerInsight);

  fs.writeFileSync(
    path.resolve(process.cwd(), 'short-insights-report.json'),
    JSON.stringify({ 
      totalBooksWithShortInsights: shortInsightsList.length, 
      totalInsightsChecked,
      books: shortInsightsList 
    }, null, 2),
    'utf-8'
  );
  
  console.log(`Checked ${totalInsightsChecked} total key insights across German books.`);
  console.log(`Found ${shortInsightsList.length} German books with very short insight explanations (avg < 50 words).`);
}

main().finally(() => prisma.$disconnect());
