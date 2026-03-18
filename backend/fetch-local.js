// fetch-local.js
fetch('http://localhost:5000/api/books')
  .then(res => res.text().then(text => console.log(`Status: ${res.status}\nBody: ${text}`)))
  .catch(err => console.error(err));
