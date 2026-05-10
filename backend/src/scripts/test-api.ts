import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function main() {
  console.log('API Key (last 8):', process.env.GEMINI_API_KEY?.slice(-8));
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent('Say hello in one word');
    console.log('✅ API works:', result.response.text().substring(0, 100));
  } catch (err: any) {
    console.log('❌ API error:', err.message);
  }
}
main();
