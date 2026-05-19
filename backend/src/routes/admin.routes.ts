import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { runCoverUpdate } from '../scripts/update-covers-helper';

const router = Router();

// Endpoint to update a single book (for bulk import)
router.post('/update-book', async (req, res) => {
  try {
    const { id, summary, keyInsights, chapters, quotes, actionItems, coverImage, secret } = req.body;

    // Require admin secret
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const dataToUpdate: any = {};
    if (summary !== undefined) dataToUpdate.summary = summary;
    if (keyInsights !== undefined) dataToUpdate.keyInsights = keyInsights;
    if (chapters !== undefined) dataToUpdate.chapters = chapters;
    if (quotes !== undefined) dataToUpdate.quotes = quotes;
    if (actionItems !== undefined) dataToUpdate.actionItems = actionItems;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;

    const updated = await prisma.book.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, book: updated });

  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Manual cover update endpoint (for free tier users)
router.post('/update-covers', async (req: Request, res: Response) => {
  try {
    // Simple secret key protection
    const secret = req.query.secret || req.body.secret;
    const expectedSecret = process.env.ADMIN_SECRET || 'your-secret-key-change-this';
    
    if (secret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please provide valid admin secret.'
      });
    }
    
    console.log('🔄 Manual cover update triggered...');
    
    const result = await runCoverUpdate();
    
    res.json({
      success: true,
      message: 'Cover update completed successfully',
      results: {
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
        total: result.total
      }
    });
    
  } catch (error: any) {
    console.error('❌ Cover update error:', error);
    res.status(500).json({
      success: false,
      message: 'Cover update failed',
      error: error.message
    });
  }
});

// GET version for easy browser access
router.get('/update-covers', async (req: Request, res: Response) => {
  try {
    const secret = req.query.secret;
    const expectedSecret = process.env.ADMIN_SECRET || 'your-secret-key-change-this';
    
    if (secret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Add ?secret=YOUR_SECRET to the URL'
      });
    }
    
    console.log('🔄 Manual cover update triggered via GET...');
    
    const result = await runCoverUpdate();
    
    // Return HTML for browser viewing
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cover Update Results</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
          .stats { background: #f3f4f6; padding: 20px; border-radius: 8px; }
          .stat { margin: 10px 0; font-size: 18px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="success">✅ Cover Update Complete!</div>
        <div class="stats">
          <div class="stat"><span class="label">Updated:</span> ${result.updated} books</div>
          <div class="stat"><span class="label">Skipped:</span> ${result.skipped} books (already optimized)</div>
          <div class="stat"><span class="label">Errors:</span> ${result.errors}</div>
          <div class="stat"><span class="label">Total Processed:</span> ${result.total}</div>
        </div>
        <p style="margin-top: 30px;">
          <a href="https://bookdigest-iota.vercel.app" target="_blank">View Website →</a>
        </p>
      </body>
      </html>
    `);
    
  } catch (error: any) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body>
        <h1 style="color: red;">❌ Error</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `);
  }
});

export default router;
