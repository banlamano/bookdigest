const urlReal = 'https://books.google.com/books/content?id=JuVnDQAAQBAJ&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api';

async function check(url) {
  const res = await fetch(url);
  console.log(`Headers for real:`, res.headers.get('content-type'));
}
check(urlReal);
