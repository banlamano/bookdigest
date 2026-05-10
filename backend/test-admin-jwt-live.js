// test-admin-jwt-live.js
async function run() {
  console.log("1. Logging in to LIVE site...");
  const loginRes = await fetch('https://bookdigest-lypx.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bookdigest.com', password: 'AdminPassword123!' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  if(!token) { console.log("Failed login:", loginData); return; }
  
  console.log("\n2. Fetching dashboard stats using JWT admin panel verification...");
  const statsRes = await fetch('https://bookdigest-lypx.onrender.com/api/admin-panel/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (statsRes.status === 200) {
    console.log(`✅ Success! The token was successfully verified by admin-panel routes on the remote server.`);
  } else {
    console.error(`❌ Failed: ${statsRes.status}`);
    console.error(await statsRes.text());
  }
}

run();
