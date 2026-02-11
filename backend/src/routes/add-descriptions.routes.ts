// API endpoint to add book descriptions from Google Books
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

interface GoogleBookData {
  volumeInfo?: {
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

async function fetchFromGoogleBooks(title: string, author: string): Promise<{ description: string | null; coverUrl: string | null }> {
  try {
    const query = `${title} ${author}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    
    const response = await axios.get<{ items?: GoogleBookData[] }>(url);
    
    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0];
      const description = book.volumeInfo?.description || null;
      const coverUrl = book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail || null;
      
      return {
        description: description ? description.substring(0, 2000) : null, // Limit to 2000 chars
        coverUrl: coverUrl ? coverUrl.replace('http:', 'https:').replace('&zoom=1', '&zoom=2') : null
      };
    }
    
    return { description: null, coverUrl: null };
  } catch (error) {
    return { description: null, coverUrl: null };
  }
}

// Endpoint to add descriptions (and covers) to books
router.post('/add-descriptions', async (req, res) => {
  const { limit = 50, offset = 0 } = req.body;
  
  try {
    console.log(`Adding descriptions: offset=${offset}, limit=${limit}`);
    
    const books = await prisma.book.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true
      }
    });
    
    let descriptionsAdded = 0;
    let coversAdded = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const book of books) {
      // Skip if already has description
      const hasDescription = book.description && book.description !== '' && book.description !== 'null';
      const hasCover = book.coverUrl && book.coverUrl !== '' && book.coverUrl !== 'null';
      
      if (hasDescription && hasCover) {
        skipped++;
        continue;
      }
      
      const data = await fetchFromGoogleBooks(book.title, book.author);
      
      const updateData: any = {};
      
      if (data.description && !hasDescription) {
        updateData.description = data.description;
        descriptionsAdded++;
      }
      
      if (data.coverUrl && !hasCover) {
        updateData.coverUrl = data.coverUrl;
        coversAdded++;
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.book.update({
          where: { id: book.id },
          data: updateData
        });
        console.log(`✅ Updated: ${book.title}`);
      } else {
        failed++;
        console.log(`❌ No data found for: ${book.title}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json({
      status: 'success',
      stats: {
        processed: books.length,
        descriptionsAdded,
        coversAdded,
        failed,
        skipped
      }
    });
    
  } catch (error) {
    console.error('Error adding descriptions:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
