import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { aiSummaryService } from '../services/ai-summary.service';

async function main() {
  console.log('Testing AI Service...');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  console.log('Service available:', aiSummaryService.isAvailable());
  
  if (!aiSummaryService.isAvailable()) {
    console.log('AI Service not available.');
    return;
  }
  
  try {
    const summary = await aiSummaryService.generateEnhancedSummary({
      title: 'Atomic Habits',
      author: 'James Clear',
      categories: ['Self-Help', 'Productivity'],
      language: 'de'
    }, 'de');
    
    console.log('Generated Summary (first 100 chars):', summary.bigIdea.substring(0, 100));
    console.log('Insights count:', summary.keyInsights.length);
    console.log('Language in response:', summary.bigIdea.includes('Habits') ? 'English?' : 'German?');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
