async function checkUrl(url: string, name: string) {
  try {
    const start = Date.now();
    const res = await fetch(url);
    const time = Date.now() - start;
    console.log(`[${name}] ${url}`);
    console.log(`  Status: ${res.status} ${res.statusText}`);
    console.log(`  Time: ${time}ms`);
    if (res.status >= 400) {
      console.warn(`  ⚠️ Warning: Status is >= 400`);
    }
  } catch (e: any) {
    console.error(`  ❌ Error querying ${name}:`, e.message);
  }
}

async function main() {
  console.log('🌐 Testing production live endpoints...\n');
  await checkUrl('https://book-digest.com', 'Frontend Live');
  await checkUrl('https://bookdigest-lypx.onrender.com', 'Backend Root Live');
  
  const url = 'https://bookdigest-lypx.onrender.com/api/books?language=de&take=2';
  try {
    const res = await fetch(url);
    const data = await res.json() as any;
    console.log(`[Backend German Books API] ${url}`);
    console.log(`  Status: ${res.status}`);
    console.log(`  Data:`, JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(`  ❌ Error querying German Books API:`, e.message);
  }
}

main();
