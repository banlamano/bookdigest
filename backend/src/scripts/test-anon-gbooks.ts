async function test() {
  const url = 'https://www.googleapis.com/books/v1/volumes?q=Schnelles+Denken+langsames+Denken+Kahneman&langRestrict=de&maxResults=3';
  console.log('Testing anonymous Google Books API...');
  const res = await fetch(url);
  const data = await res.json() as any;
  
  if (data.error) {
    console.log('ERROR:', data.error.code, data.error.message);
  } else {
    console.log('SUCCESS! Items found:', data.totalItems);
    data.items?.slice(0, 3).forEach((i: any) => {
      const v = i.volumeInfo;
      const cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
      console.log(`  "${v.title}" lang=${v.language} cover=${cover ? 'YES' : 'NO'}`);
      if (cover) console.log(`    ${cover}`);
    });
  }
}

test();
