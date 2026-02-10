// Script to fetch and add book covers from Google Books API
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface GoogleBookData {
  volumeInfo?: {
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    description?: string;
  };
}

async function fetchCoverFromGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    const query = `${title} ${author}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    
    const response = await axios.get<{ items?: GoogleBookData[] }>(url);
    
    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0];
      const coverUrl = book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail;
      
      if (coverUrl) {
        // Convert to HTTPS and higher resolution
        return coverUrl.replace('http:', 'https:').replace('&zoom=1', '&zoom=2');
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching cover for "${title}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function addCovers() {
  console.log('\n🎨 ADDING BOOK COVERS FROM GOOGLE BOOKS\n');
  console.log('='.repeat(80));
  
  try {
    // Get all books without covers
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true
      }
    });
    
    console.log(`\nTotal books: ${books.length}`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      
      // Skip if already has cover
      if (book.coverUrl && book.coverUrl !== '' && book.coverUrl !== 'null') {
        skipped++;
        continue;
      }
      
      console.log(`\n[${i + 1}/${books.length}] ${book.title} by ${book.author}`);
      
      const coverUrl = await fetchCoverFromGoogleBooks(book.title, book.author);
      
      if (coverUrl) {
        await prisma.book.update({
          where: { id: book.id },
          data: { coverUrl }
        });
        
        updated++;
        console.log(`  ✅ Added cover: ${coverUrl.substring(0, 60)}...`);
      } else {
        failed++;
        console.log(`  ❌ No cover found`);
      }
      
      // Rate limiting - Google Books API allows 1000 requests per day
      // Wait 1 second between requests to be safe
      if (i < books.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Progress update every 10 books
      if ((i + 1) % 10 === 0) {
        const progress = Math.round(((i + 1) / books.length) * 100);
        console.log(`\n📊 Progress: ${progress}% | Updated: ${updated} | Failed: ${failed} | Skipped: ${skipped}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ COVER ADDITION COMPLETE!\n');
    console.log(`Total books: ${books.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped (already had covers): ${skipped}`);
    console.log(`\nSuccess rate: ${Math.round((updated / (books.length - skipped)) * 100)}%\n`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCovers();
