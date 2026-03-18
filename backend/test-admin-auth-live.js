// test-admin-auth-live.js
async function run() {
  console.log("1. Logging in to LIVE site...");
  const loginRes = await fetch('https://bookdigest-lypx.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bookdigest.com', password: 'AdminPassword123!' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  
  console.log("\n2. Fetching profile using standard auth middleware...");
  const profileRes = await fetch('https://bookdigest-lypx.onrender.com/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (profileRes.status === 200) {
    console.log("✅ Profile fetched successfully! This means `process.env.JWT_SECRET!` verified the token successfully.");
  } else {
    console.error(`❌ Profile fetch failed: ${profileRes.status}`);
    console.error(await profileRes.text());
  }
}

run();
