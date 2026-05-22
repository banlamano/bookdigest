// API endpoint to add book descriptions from Google Books
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import axios from 'axios';

const router = Router();

interface GoogleBookData {
  volumeInfo?: {
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

async function fetchFromGoogleBooks(title: string, author: string): Promise<{ description: string | null; coverImage: string | null }> {
  try {
    const query = `${title} ${author}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    
    const response = await axios.get<{ items?: GoogleBookData[] }>(url, { timeout: 8000 });
    
    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0];
      const description = book.volumeInfo?.description || null;
      const cover = book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail || null;
      
      return {
        description: description ? description.substring(0, 2000) : null, // Limit to 2000 chars
        coverImage: cover ? cover.replace('http:', 'https:').replace('&zoom=1', '&zoom=2') : null
      };
    }
    
    return { description: null, coverImage: null };
  } catch (error) {
    return { description: null, coverImage: null };
  }
}

// Endpoint to add descriptions (and covers) to books
router.post('/add-descriptions', async (req, res) => {
  const secret = req.body.secret || req.headers['x-admin-key'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const { limit = 50, offset = 0, delayMs = 100 } = req.body;
  
  try {
    console.log(`Adding descriptions: offset=${offset}, limit=${limit}`);
    
    const books = await prisma.book.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverImage: true
      }
    });
    
    let descriptionsAdded = 0;
    let coversAdded = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const book of books) {
      // Skip if already has description
      const hasDescription = book.description && book.description !== '' && book.description !== 'null';
      const hasCover = book.coverImage && book.coverImage !== '' && book.coverImage !== 'null';
      
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
      
      if (data.coverImage && !hasCover) {
        updateData.coverImage = data.coverImage;
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
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
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
