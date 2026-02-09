import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import paymentRoutes from './routes/payment.routes';
import progressRoutes from './routes/progress.routes';
import seedRoutes from './routes/seed.routes';
import regenerateRoutes from './routes/regenerate.routes';
import adminRoutes from './routes/admin.routes';
import adminSimpleRoutes from './routes/admin-simple.routes';
import emailCaptureRoutes from './routes/email-capture.routes';
import updateCoversRoutes from './routes/update-covers.routes';
import listBooksRoutes from './routes/list-books.routes';
import adminPanelRoutes from './routes/admin-panel.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://bookdigest-iota.vercel.app',
    'https://book-digest.com',
    'https://www.book-digest.com',
    'http://localhost:3000',
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Webhook endpoint needs raw body - must come BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', progressRoutes);
app.use('/api', seedRoutes);
app.use('/api/admin', regenerateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-simple', adminSimpleRoutes);
app.use('/api/email-capture', emailCaptureRoutes);
app.use('/api/admin', updateCoversRoutes);
app.use('/api/admin-simple', listBooksRoutes);
app.use('/api/admin-panel', adminPanelRoutes);

// Error handling
app.use(errorHandler);

// Auto-update book covers on startup (runs once when server starts)
async function updateCoversOnStartup() {
  // Run on startup (checks if books need updating)
  logger.info('🔄 Checking for cover updates...');
  
  try {
    const { runCoverUpdate } = await import('./scripts/update-covers-helper');
    const result = await runCoverUpdate();
    logger.info(`✅ Cover update complete: ${result.updated} updated, ${result.skipped} skipped`);
    return result;
  } catch (error: any) {
    logger.warn('⚠️ Cover update failed (non-critical):', error.message);
    return { updated: 0, skipped: 0, errors: 1, total: 0 };
  }
}

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV}`);
  
  // Run cover update in background (don't block server startup)
  updateCoversOnStartup().catch(err => 
    logger.warn('Cover update background task failed:', err)
  );
});

export default app;
