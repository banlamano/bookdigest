import { Router, Request, Response } from 'express';
import { runStreakWarnings } from '../jobs/streak-warning.job';
import { runWeeklySeoReport } from '../jobs/seo-report.job';
import { prisma } from '../lib/prisma';
import { syncContact, SyncContact } from '../services/resend-audience.service';

const router = Router();

/**
 * Secret-protected cron endpoints. Intended for external schedulers
 * (Vercel Cron, Render Cron Job, cron-job.org, GitHub Actions, etc.)
 * as a backup or replacement for the in-process node-cron schedule.
 *
 * Auth: pass the ADMIN_SECRET either as ?secret=<value> or as
 * Authorization: Bearer <value>. Same secret as admin-simple routes
 * — keep rotation in sync.
 */
function checkCronSecret(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
  const provided =
    (req.query.secret as string | undefined) ||
    req.header('Authorization')?.replace(/^Bearer\s+/i, '') ||
    (req.body && req.body.secret);
  return provided === secret;
}

router.post('/streak-warnings', async (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  try {
    const result = await runStreakWarnings();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Allow GET too — some cron services only support GET requests.
router.get('/streak-warnings', async (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  try {
    const result = await runStreakWarnings();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Weekly SEO report — generate + email it on demand. Backup for the
// in-process cron, and handy for testing ("does it actually send?").
// Optional ?days=28 to widen the window. GET + POST both supported.
async function seoReportHandler(req: Request, res: Response) {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  try {
    const days = parseInt((req.query.days as string) || '7', 10) || 7;
    const result = await runWeeklySeoReport(days);
    res.json({ success: result.sent, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
router.post('/seo-report', seoReportHandler);
router.get('/seo-report', seoReportHandler);

// Diagnostic: which SEO-report env vars can the running process actually
// see? Presence booleans only — values are never returned. Exists because
// "I saved them in the dashboard" and "the dyno sees them" can disagree
// (wrong service, unlinked env group, stale deploy).
router.get('/env-check', (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  const present = (v?: string) => !!(v && v.trim());
  res.json({
    success: true,
    env: {
      SEO_REPORT_EMAIL: present(process.env.SEO_REPORT_EMAIL),
      GOOGLE_SA_KEY_JSON: present(process.env.GOOGLE_SA_KEY_JSON),
      SC_SITE_URL: present(process.env.SC_SITE_URL),
      GA4_PROPERTY_ID: present(process.env.GA4_PROPERTY_ID),
      RESEND_API_KEY: present(process.env.RESEND_API_KEY),
    },
    // Surface near-miss key names (typos, stray spaces) without leaking values.
    similarKeys: Object.keys(process.env).filter(k =>
      /SEO|GA4|GOOGLE_SA|SC_SITE/i.test(k)
    ),
  });
});

/**
 * Trigger the one-shot Resend Audience backfill from prod, where the
 * RESEND_API_KEY actually exists. Body: { secret, dryRun?: boolean }.
 * Walks subscribers + users, dedupes, and upserts into the language-
 * matched Resend Audience. Idempotent — safe to re-run.
 */
router.post('/sync-resend-audience', async (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }

  const dryRun = req.body?.dryRun === true;

  try {
    const [subs, users] = await Promise.all([
      prisma.emailSubscriber.findMany({
        select: { email: true, language: true, unsubscribedAt: true },
      }),
      prisma.user.findMany({
        select: { email: true, firstName: true, lastName: true, language: true, unsubscribedAt: true },
      }),
    ]);

    const map = new Map<string, SyncContact>();

    for (const s of subs) {
      map.set(s.email.toLowerCase(), {
        email: s.email,
        language: (s.language === 'de' ? 'de' : 'en'),
        unsubscribed: !!s.unsubscribedAt,
      });
    }
    for (const u of users) {
      const key = u.email.toLowerCase();
      const existing = map.get(key);
      map.set(key, {
        email: u.email,
        firstName: u.firstName ?? existing?.firstName,
        lastName: u.lastName ?? existing?.lastName,
        language: existing?.language || (u.language === 'de' ? 'de' : 'en'),
        unsubscribed: (existing?.unsubscribed ?? false) || !!u.unsubscribedAt,
      });
    }
    const contacts = [...map.values()];

    const byLang = contacts.reduce<Record<'en' | 'de', number>>(
      (acc, c) => { acc[c.language] += 1; return acc; },
      { en: 0, de: 0 },
    );

    if (dryRun) {
      return res.json({
        success: true,
        dryRun: true,
        total: contacts.length,
        byLanguage: byLang,
        envConfigured: {
          en: !!process.env.RESEND_AUDIENCE_EN_ID,
          de: !!process.env.RESEND_AUDIENCE_DE_ID,
          apiKey: !!process.env.RESEND_API_KEY,
        },
      });
    }

    let created = 0, updated = 0, skipped = 0, failed = 0;
    const errors: string[] = [];

    for (const c of contacts) {
      const result = await syncContact(c);
      switch (result.action) {
        case 'created': created += 1; break;
        case 'updated': updated += 1; break;
        case 'skipped': skipped += 1; break;
        case 'failed':
          failed += 1;
          if (errors.length < 10) errors.push(`${c.email}: ${result.error}`);
          break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    return res.json({
      success: true,
      total: contacts.length,
      byLanguage: byLang,
      created, updated, skipped, failed,
      sampleErrors: errors,
    });
  } catch (err: any) {
    console.error('sync-resend-audience failed:', err);
    return res.status(500).json({ success: false, message: err?.message ?? 'Failed' });
  }
});

export default router;
