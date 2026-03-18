// bypass-test.js
async function run() {
  console.log("Fetching using x-admin-key...");
  const statsRes = await fetch('https://bookdigest-lypx.onrender.com/api/admin-panel/dashboard/stats', {
    headers: { 'x-admin-key': 'bookdigest-secure-admin-2026-key' }
  });
  
  if (statsRes.status === 200) {
    console.log("Success with admin key!");
  } else {
    console.log(`Failed: ${statsRes.status}`);
  }
}
run();
