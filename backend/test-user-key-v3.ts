import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyDv1i1B9WnOBsvkd1NZsOo_2ZrjpSFWnVo'; 

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
