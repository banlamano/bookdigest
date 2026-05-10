import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function testLimit(modelName: string) {
  console.log(`Testing limit for: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });
  for (let i = 1; i <= 25; i++) {
    try {
      await model.generateContent("Say 'hi'");
      console.log(`  [${i}] Success`);
    } catch (e: any) {
      console.log(`  [${i}] FAILED: ${e.message}`);
      break;
    }
  }
}

async function main() {
  await testLimit('gemini-2.5-flash');
}

main().catch(console.error);
