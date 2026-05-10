import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyCjRqfadCe_-EAS9naH_FswAbgY9H8ltas'; // Hardcoded from user message

async function test() {
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
