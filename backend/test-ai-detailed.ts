import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

import { aiSummaryService } from './src/services/ai-summary.service';

async function test() {
  try {
    const res = await aiSummaryService.generateEnhancedSummary({
      title: 'Dare to Lead',
      author: 'Brené Brown',
      language: 'en'
    });
    console.log('SUCCESS! Word Count:', JSON.stringify(res).split(/\s+/).length);
  } catch (e: any) {
    console.error('FAILURE:', e.message);
  }
}

test();
