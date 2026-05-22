const title = "Die Farbe des Gesetzes";
const author = "Richard Rothstein";

async function run() {
  const query = encodeURIComponent(`${title} ${author}`);
  const url = `https://openlibrary.org/search.json?q=${query}&language=ger`;
  
  console.log('Fetching:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.docs && data.docs.length > 0) {
    const doc = data.docs.find((d: any) => d.cover_i);
    if (doc) {
      console.log('Found cover URL:', `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
    } else {
      console.log('No cover found in docs.');
    }
  } else {
    console.log('No docs returned.');
  }
}

run();
