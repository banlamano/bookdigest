// API endpoint to add book covers from Google Books
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

interface GoogleBookData {
  volumeInfo?: {
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
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
        return coverUrl.replace('http:', 'https:').replace('&zoom=1', '&zoom=2');
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Endpoint to add covers to all books
router.post('/add-covers', async (req, res) => {
  const { limit = 50, offset = 0 } = req.body;
  
  try {
    console.log(`Adding covers: offset=${offset}, limit=${limit}`);
    
    const books = await prisma.book.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true
      }
    });
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const book of books) {
      // Skip if already has cover
      if (book.coverUrl && book.coverUrl !== '' && book.coverUrl !== 'null') {
        skipped++;
        continue;
      }
      
      const coverUrl = await fetchCoverFromGoogleBooks(book.title, book.author);
      
      if (coverUrl) {
        await prisma.book.update({
          where: { id: book.id },
          data: { coverUrl }
        });
        updated++;
        console.log(`✅ Added cover for: ${book.title}`);
      } else {
        failed++;
        console.log(`❌ No cover found for: ${book.title}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json({
      status: 'success',
      stats: {
        processed: books.length,
        updated,
        failed,
        skipped
      }
    });
    
  } catch (error) {
    console.error('Error adding covers:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
