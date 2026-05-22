import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const keys = [
  process.env.GOOGLE_BOOKS_API_KEY,
  'AIzaSyAQUPzpg8NmmX_sYuL7BiUEztEzd0B-4WQ',
  'AIzaSyBHz9_UrFxS89_5BknKc60FWXEAuzFILGY',
  'AIzaSyDv1i1B9WnOBsvkd1NZsOo_2ZrjpSFWnVo'
];

async function testKey(key: string | undefined, index: number) {
  if (!key) {
    console.log(`Key ${index}: UNDEFINED`);
    return;
  }
  const url = `https://www.googleapis.com/books/v1/volumes?q=Schnelles+Denken+langsames+Denken+Kahneman&langRestrict=de&maxResults=3&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json() as any;
    if (data.error) {
      console.log(`Key ${index} (${key.substring(0, 10)}...): FAILED:`, data.error.code, data.error.message);
    } else {
      console.log(`Key ${index} (${key.substring(0, 10)}...): SUCCESS! Total items:`, data.totalItems);
    }
  } catch (e: any) {
    console.log(`Key ${index} (${key.substring(0, 10)}...): EXCEPTION:`, e.message);
  }
}

async function main() {
  for (let i = 0; i < keys.length; i++) {
    await testKey(keys[i], i);
  }
}

main();
