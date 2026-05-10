import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyAs5P5GSX8ykF5eI4PYF53lVoK1oxAlFv8'; 

async function findWorkingModel() {
  const models = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: m }); 
      const result = await model.generateContent('Hi');
      console.log(`✅ ${m} WORKS! Result:`, result.response.text().substring(0, 20));
      return m;
    } catch (e: any) {
      console.log(`❌ ${m} FAILED:`, e.message);
    }
  }
  return null;
}

findWorkingModel();
