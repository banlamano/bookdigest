import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyAs5P5GSX8ykF5eI4PYF53lVoK1oxAlFv8'; 

async function findFunctionalModel() {
  const models = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-pro-latest',
    'gemini-flash-latest'
  ];

  for (const m of models) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hi');
      console.log(`✅ SUCCESS! Model: ${m}`);
      return m;
    } catch (e: any) {
      console.log(`❌ FAILED! Model: ${m}. Error: ${e.message}`);
    }
  }
}

findFunctionalModel();
