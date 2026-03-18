// fetch-error.js
fetch('https://bookdigest-lypx.onrender.com/api/books')
  .then(res => res.text().then(text => console.log(`Status: ${res.status}\nBody: ${text}`)))
  .catch(err => console.error(err));
