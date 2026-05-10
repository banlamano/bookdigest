import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyAs5P5GSX8ykF5eI4PYF53lVoK1oxAlFv8'; 

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use the exact strings from your account's model list
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
    const result = await model.generateContent('Hi');
    console.log(`SUCCESS!`, result.response.text());
  } catch (e: any) {
    console.log(`FAILURE!`, e.message);
  }
}

test();
