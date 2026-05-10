import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY;

async function test() {
  if (!key) {
    console.log('NO KEY FOUND IN .ENV');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Hi');
    console.log(`SUCCESS! Response:`, result.response.text());
  } catch (e: any) {
    console.log(`FAILURE!`, e.message);
  }
}

test();
