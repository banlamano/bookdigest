const title = "Die Farbe des Gesetzes";
const author = "Richard Rothstein";

async function run() {
  const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=de`;
  
  console.log('Fetching:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Response:', JSON.stringify(data, null, 2));
}

run();
