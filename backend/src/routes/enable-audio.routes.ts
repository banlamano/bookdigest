import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * Admin-only endpoint to enable audio for all books
 * Sets audioUrl to 'browser-tts' for browser Web Speech API
 */
router.post('/enable-audio', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('Enabling audio for all books...');
    
    // Update all books with null or empty audioUrl
    const result = await prisma.book.updateMany({
      where: {
        OR: [
          { audioUrl: null },
          { audioUrl: '' }
        ]
      },
      data: {
        audioUrl: 'browser-tts'
      }
    });

    console.log(`Updated ${result.count} books`);

    // Get verification count
    const totalWithAudio = await prisma.book.count({
      where: { audioUrl: 'browser-tts' }
    });

    res.json({
      success: true,
      message: 'Audio feature enabled for all books',
      data: {
        updated: result.count,
        totalWithAudio: totalWithAudio,
        audioType: 'browser-tts (Web Speech API)'
      }
    });

  } catch (error) {
    console.error('Error enabling audio:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enable audio'
    });
  }
});

export default router;
