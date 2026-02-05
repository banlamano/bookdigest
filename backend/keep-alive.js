// Keep Render backend alive by pinging every 10 minutes
const https = require('https');

const BACKEND_URL = 'https://bookdigest-lypx.onrender.com/health';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

function ping() {
  https.get(BACKEND_URL, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error('Keep-alive error:', err.message);
  });
}

// Ping immediately
ping();

// Then ping every 10 minutes
setInterval(ping, PING_INTERVAL);

console.log('Keep-alive service started. Pinging every 10 minutes...');
