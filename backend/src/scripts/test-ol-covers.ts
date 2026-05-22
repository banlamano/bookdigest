import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testCovers() {
  const books = await prisma.book.findMany({
    where: { language: 'de' },
    select: { title: true, author: true, id: true, coverImage: true },
    take: 10
  });

  for (const book of books) {
    const query = encodeURIComponent(`${book.title} ${book.author}`);
    const url = `https://openlibrary.org/search.json?q=${query}&language=ger`;
    console.log(`\nChecking "${book.title}" by ${book.author}...`);
    try {
      const res = await fetch(url);
      const data: any = await res.json();
      if (data.docs && data.docs.length > 0) {
        const doc = data.docs.find((d: any) => d.cover_i);
        if (doc) {
          console.log(`  ✅ Found OpenLibrary cover: https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
          if (doc.isbn && doc.isbn.length > 0) {
            console.log(`  Isbns: ${doc.isbn.slice(0, 3).join(', ')}`);
          }
        } else {
          console.log(`  ❌ No cover_i in docs`);
        }
      } else {
        console.log(`  ❌ No docs found on OpenLibrary`);
      }
    } catch (e: any) {
      console.log(`  💥 Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

testCovers().finally(() => prisma.$disconnect());
