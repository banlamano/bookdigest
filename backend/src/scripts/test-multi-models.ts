import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS_TO_TEST = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  for (const modelName of MODELS_TO_TEST) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'Hello' and nothing else.");
      console.log(`✅ ${modelName} is WORKING:`, result.response.text());
    } catch (error: any) {
      console.log(`❌ ${modelName} FAILED:`, error.message);
    }
  }
}

main().catch(console.error);
