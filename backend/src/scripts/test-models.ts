import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite', 
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.5-flash-preview-05-20',
];

async function testModel(modelName: string) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "hello" in JSON format: {"greeting": "hello"}');
    const text = result.response.text();
    console.log(`✅ ${modelName}: WORKS - ${text.substring(0, 80)}`);
    return true;
  } catch (e: any) {
    console.log(`❌ ${modelName}: ${e.message.substring(0, 120)}`);
    return false;
  }
}

async function main() {
  console.log('Testing available Gemini models...\n');
  for (const name of modelsToTest) {
    await testModel(name);
    await new Promise(r => setTimeout(r, 2000));
  }
}

main();
