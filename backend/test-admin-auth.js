// test-admin-auth.js
async function run() {
  console.log("1. Logging in...");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bookdigest.com', password: 'AdminPassword123!' })
  });
  
  const loginData = await loginRes.json();
  if (!loginData.data || !loginData.data.token) {
    console.error("Login failed:", loginData);
    return;
  }
  
  const token = loginData.data.token;
  console.log("Token acquired:", token.substring(0, 20) + "...");
  console.log("Role:", loginData.data.user.role);
  
  console.log("\n2. Fetching admin dashboard stats...");
  const statsRes = await fetch('http://localhost:5000/api/admin-panel/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (statsRes.status === 200) {
    const statsData = await statsRes.json();
    console.log("Success! Stats data retrieved:");
    console.log(`Total Books: ${statsData.data.totalBooks}`);
  } else {
    console.error(`Status: ${statsRes.status}`);
    console.error(await statsRes.text());
  }
}

run();
