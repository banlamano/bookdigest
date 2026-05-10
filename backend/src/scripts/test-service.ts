import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { aiSummaryService } from '../services/ai-summary.service';

async function main() {
  const data = await aiSummaryService.generateEnhancedSummary({
    title: 'How to Win at the Sport of Business',
    author: 'Mark Cuban',
    language: 'en'
  });
  console.log('Result length bigIdea:', data.bigIdea.length);
}
main().catch(console.error);
