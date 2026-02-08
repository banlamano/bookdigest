import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Simple admin endpoint to update a book (temporary for fixing books one-by-one)
// Protected by secret key instead of auth
router.post('/update-book-simple', async (req, res) => {
  try {
    const { bookId, amazonLink, coverImage, secret } = req.body;

    // Simple secret check (change this to something only you know)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
    
    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid secret key' 
      });
    }

    if (!bookId) {
      return res.status(400).json({ 
        success: false, 
        message: 'bookId is required' 
      });
    }

    if (!amazonLink && !coverImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either amazonLink or coverImage is required' 
      });
    }

    // Build update data
    const updateData: any = {};
    if (amazonLink) updateData.amazonLink = amazonLink;
    if (coverImage) updateData.coverImage = coverImage;

    // Update the book
    const book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { 
        bookId: book.id,
        title: book.title,
        amazonLink: book.amazonLink,
        coverImage: book.coverImage
      },
    });

  } catch (error: any) {
    console.error('Error updating book:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update book' 
    });
  }
});

export default router;
