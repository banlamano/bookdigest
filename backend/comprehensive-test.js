// comprehensive-test.js
const endpoints = {
  local: 'http://localhost:5000',
  live: 'https://bookdigest-lypx.onrender.com'
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function checkHealth(url) {
  try {
    const res = await fetch(`${url}/health`);
    return res.status === 200;
  } catch (e) {
    console.error(`  [Health Error]: ${e.message}`);
    return false;
  }
}

async function checkBooks(url) {
  try {
    const res = await fetch(`${url}/api/books?limit=1`);
    const data = await res.json();
    return data.status === 'success' || data.success === true;
  } catch (e) {
    console.error(`  [Books Error]: ${e.message}`);
    return false;
  }
}

async function checkAdminStats(url, token) {
  try {
    const res = await fetch(`${url}/api/admin-panel/dashboard/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error(`  [Admin Stats JSON Error]: ${text.substring(0, 100)}`);
        return false;
    }
    return res.status === 200 && data.success === true;
  } catch (e) {
    console.error(`  [Admin Stats Error]: ${e.message}`);
    return false;
  }
}

async function loginAndGetToken(url) {
  try {
    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bookdigest.com', password: 'AdminPassword123!' })
    });
    const data = await res.json();
    return data.data?.token || null;
  } catch (e) {
    console.error(`  [Login Error]: ${e.message}`);
    return null;
  }
}

async function run() {
  console.log('🚀 Starting Comprehensive System Check...\n');

  for (const env of ['local', 'live']) {
    console.log(`[${env.toUpperCase()} ENVIRONMENT] - ${endpoints[env]}`);
    
    const healthy = await checkHealth(endpoints[env]);
    console.log(`  - Health Check: ${healthy ? '✅ OK' : '❌ FAILED'}`);

    const booksOk = await checkBooks(endpoints[env]);
    console.log(`  - Books API:    ${booksOk ? '✅ OK' : '❌ FAILED'}`);

    const token = await loginAndGetToken(endpoints[env]);
    if (token) {
      console.log(`  - Login:        ✅ SUCCESS`);
      const adminOk = await checkAdminStats(endpoints[env], token);
      console.log(`  - Admin Stats:  ${adminOk ? '✅ ACCESSIBLE' : '❌ ACCESS DENIED'}`);
    } else {
      console.log(`  - Login:        ❌ FAILED`);
    }
    console.log('');
  }

  console.log('📋 Data Quality Check:');
}

run();
