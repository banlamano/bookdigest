import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { aiSummaryService } from './src/services/ai-summary.service';

async function testExpansion() {
  try {
    console.log('Testing expansion for "Grit"...');
    const result = await aiSummaryService.generateEnhancedSummary({
      title: 'Grit',
      author: 'Angela Duckworth',
      language: 'en'
    });
    console.log('SUCCESS! Word count:', JSON.stringify(result).split(/\s+/).length);
    if (result.bigIdea.includes('transformative guide')) {
      console.log('FALLBACK DETECTED!');
    } else {
      console.log('PREMIUM CONTENT DETECTED!');
    }
  } catch (e: any) {
    console.log('FAILURE!', e.message);
  }
}

testExpansion();
