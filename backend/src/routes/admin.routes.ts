import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Endpoint to update a single book (for bulk import)
router.post('/update-book', async (req, res) => {
  try {
    const { id, summary, keyInsights, chapters, quotes, actionItems } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        summary,
        keyInsights,
        chapters,
        quotes,
        actionItems
      }
    });

    res.json({ success: true, book: updated });

  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

export default router;
