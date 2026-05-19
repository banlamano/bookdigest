import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import { prisma } from '../lib/prisma';

const router = Router();

// Seed endpoint - only use once!
router.post('/seed-books', async (req: Request, res: Response) => {
  // Require admin secret
  const secret = req.body.secret || req.headers['x-admin-key'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    res.setHeader('Content-Type', 'text/plain');
    res.write('🌱 Starting database seed...\n\n');

    // Run seed script
    res.write('📚 Seeding 454 books...\n');
    execSync('npm run prisma:seed:500', { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    res.write('✅ Books seeded!\n\n');

    // Generate summaries
    res.write('🤖 Generating summaries...\n');
    execSync('npm run generate:summaries', { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    res.write('✅ Summaries generated!\n\n');

    res.write('🎉 Database seeded successfully with 454 books!\n');
    res.end();
  } catch (error: any) {
    res.write(`\n❌ Error: ${error.message}\n`);
    res.status(500).end();
  }
});

// Check seed status (admin only)
router.get('/seed-status', async (req: Request, res: Response) => {
  const secret = req.query.secret || req.headers['x-admin-key'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const bookCount = await prisma.book.count();
    const categoryCount = await prisma.category.count();

    res.json({
      success: true,
      books: bookCount,
      categories: categoryCount,
      seeded: bookCount > 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
