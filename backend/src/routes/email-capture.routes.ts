import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';

const router = Router();

/**
 * Newsletter popup signup. Stores the email in EmailSubscriber and sends a
 * welcome message. The endpoint is public — keep noisy and idempotent:
 *   - duplicate email returns success (don't leak existence)
 *   - upsert on email lets repeat signups update the source/timestamp
 *   - always return the same success message regardless of whether the
 *     email actually deliverable
 *
 * The previous implementation just console.log'd the email and returned
 * success — subscribers thought they signed up but got nothing.
 */
router.post('/capture', async (req, res) => {
  try {
    const { email, source } = req.body;
    const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalized || !normalized.includes('@') || !normalized.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required',
      });
    }

    // Save (or refresh) the subscriber. Idempotent — no harm if they sign up twice.
    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        source: typeof source === 'string' ? source.slice(0, 32) : 'popup',
      },
      update: {
        // Refresh source if it changed (e.g., they hit the footer and the popup)
        ...(typeof source === 'string' ? { source: source.slice(0, 32) } : {}),
      },
    });

    // Fire-and-forget welcome email. We DON'T await — the user shouldn't wait
    // on Resend latency. Errors are logged inside the service.
    void EmailService.sendNewsletterWelcome(normalized).catch(err =>
      console.error('Newsletter welcome failed:', err)
    );

    return res.json({
      success: true,
      message: 'Subscribed — check your inbox for a welcome email.',
      data: { email: normalized, subscriberId: subscriber.id },
    });
  } catch (error: any) {
    console.error('Email capture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to capture email',
    });
  }
});

/**
 * Diagnostic endpoint — used to verify Resend is correctly configured in
 * production. Protected by ADMIN_SECRET so it can't be used as a free email
 * relay by anyone with the URL.
 *
 * GET  /api/email-capture/diagnostic?secret=...           → config status
 * POST /api/email-capture/diagnostic { secret, to }       → fire a test email
 */
router.get('/diagnostic', (req, res) => {
  const secret = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
  if (req.query.secret !== secret) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  return res.json({ success: true, data: EmailService.getConfigStatus() });
});

router.post('/diagnostic', async (req, res) => {
  const secret = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
  if (req.body?.secret !== secret) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  const to = typeof req.body.to === 'string' ? req.body.to.trim() : '';
  if (!to || !to.includes('@')) {
    return res.status(400).json({ success: false, message: '`to` must be an email' });
  }
  const result = await EmailService.sendDiagnosticTestEmail(to);
  return res.json({
    success: result.ok,
    config: EmailService.getConfigStatus(),
    ...result,
  });
});

export default router;
