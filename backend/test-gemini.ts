import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

async function run() {
  try {
    const result = await model.generateContent("Hello, translate this to German: 'The Power of Vulnerability'");
    const response = await result.response;
    console.log(response.text());
  } catch (e) {
    console.error(e);
  }
}
run();
