import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await resp.json();
  
  const generateContentModels = data.models
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => m.name);
  
  console.log('Models supporting generateContent:');
  generateContentModels.forEach((name: string) => console.log(`  ${name}`));
  console.log(`\nTotal: ${generateContentModels.length}`);
}

main();
