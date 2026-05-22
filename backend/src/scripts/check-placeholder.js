const urlReal = 'https://books.google.com/books/content?id=JuVnDQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api';
const urlPlaceholder = 'https://books.google.com/books/content?id=XFUaAAAACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api';

async function check(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  console.log(`Size: ${buffer.byteLength} for ${url}`);
  return buffer.byteLength;
}

async function run() {
  await check(urlReal);
  await check(urlPlaceholder);
}
run();
