const https = require('https');
const crypto = require('crypto');

function downloadAndHash(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        return resolve(downloadAndHash(redirectUrl));
      }
      
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        resolve({
          url,
          status: res.statusCode,
          size: buffer.length,
          hash: hash
        });
      });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const url = 'https://covers.openlibrary.org/b/isbn/9781400052172-L.jpg';
  console.log(await downloadAndHash(url));
  
  // also test a known google books bad cover?
  // Let's test a couple more known URLs if any.
}
run();
