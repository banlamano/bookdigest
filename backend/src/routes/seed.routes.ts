import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';

const router = Router();

// Seed endpoint - only use once!
router.post('/seed-books', async (req: Request, res: Response) => {
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

// Check seed status
router.get('/seed-status', async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const bookCount = await prisma.book.count();
    const categoryCount = await prisma.category.count();
    
    res.json({
      success: true,
      books: bookCount,
      categories: categoryCount,
      seeded: bookCount > 0
    });
    
    await prisma.$disconnect();
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
