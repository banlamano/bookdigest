import { GoogleGenerativeAI } from '@google/generative-ai';

const key1 = 'AIzaSyAQUPzpg8NmmX_sYuL7BiUEztEzd0B-4WQ';
const key2 = 'AIzaSyBHz9_UrFxS89_5BknKc60FWXEAuzFILGY';

async function test(key: string, name: string) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Hi');
    console.log(`${name}: SUCCESS!`, result.response.text());
  } catch (e: any) {
    console.log(`${name}: FAILURE!`, e.message);
  }
}

test(key1, 'KEY_EN');
test(key2, 'KEY_DEV');
