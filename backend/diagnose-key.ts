import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyDv1i1B9WnOBsvkd1NZsOo_2ZrjpSFWnVo'; 

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Hi');
    console.log(`STATUS: SUCCESS`);
  } catch (e: any) {
    console.log(`STATUS: FAILED`);
    console.log(`ERROR_MESSAGE: ${e.message}`);
    if (e.stack) console.log(`ERROR_STACK: ${e.stack.substring(0, 300)}`);
  }
}

test();
