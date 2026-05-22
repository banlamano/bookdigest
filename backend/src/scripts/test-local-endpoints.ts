async function checkUrl(url: string, name: string) {
  try {
    const start = Date.now();
    const res = await fetch(url);
    const time = Date.now() - start;
    console.log(`[${name}] ${url}`);
    console.log(`  Status: ${res.status} ${res.statusText}`);
    console.log(`  Time: ${time}ms`);
  } catch (e: any) {
    console.error(`  ❌ Error querying ${name}:`, e.message);
  }
}

async function main() {
  console.log('🖥️ Testing local development endpoints...\n');
  await checkUrl('http://localhost:3000', 'Local Frontend');
  await checkUrl('http://localhost:5000/api/books?language=de&take=1', 'Local Backend API');
}

main();
