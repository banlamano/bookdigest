require('dotenv').config();
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BookDigest/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
  });
}

async function main() {
  const q = encodeURIComponent(`After You Jojo Moyes`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
  const data = await fetchJson(url);
  console.log(JSON.stringify(data.items[0].volumeInfo.imageLinks, null, 2));
}
main();
