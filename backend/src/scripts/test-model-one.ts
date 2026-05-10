import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const modelName = 'gemini-1.5-flash';
  console.log(`Testing model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`SUCCESS: ${result.response.text().trim()}`);
  } catch (e: any) {
    console.log(`FAILED: ${e.message}`);
  }
}
main();
