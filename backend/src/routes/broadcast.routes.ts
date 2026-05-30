import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';

const router = Router();

function checkAdminSecret(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
  const provided =
    (req.query.secret as string | undefined) ||
    req.header('Authorization')?.replace(/^Bearer\s+/i, '') ||
    (req.body && req.body.secret);
  return provided === secret;
}

type Lang = 'en' | 'de';
type Segment = 'all' | 'subscribers' | 'users';
type LangFilter = 'all' | Lang;

/**
 * Build the recipient list. Subscribers and registered users are unioned
 * and deduplicated by email (a user who also signed up via the popup gets
 * just one send). Skips unsubscribed subscribers; we don't yet have an
 * unsubscribe flag on User, but premium-active users still get marketing
 * (you may want to filter later).
 */
async function buildRecipients(segment: Segment, langFilter: LangFilter) {
  const byEmail = new Map<string, { email: string; language: Lang }>();

  if (segment === 'all' || segment === 'subscribers') {
    const subs = await prisma.emailSubscriber.findMany({
      where: {
        unsubscribedAt: null,
        ...(langFilter !== 'all' ? { language: langFilter } : {}),
      },
      select: { email: true, language: true },
    });
    for (const s of subs) {
      byEmail.set(s.email.toLowerCase(), {
        email: s.email,
        language: s.language === 'de' ? 'de' : 'en',
      });
    }
  }

  if (segment === 'all' || segment === 'users') {
    const users = await prisma.user.findMany({
      where: langFilter !== 'all' ? { language: langFilter } : {},
      select: { email: true, language: true },
    });
    for (const u of users) {
      const key = u.email.toLowerCase();
      // If the address is already in the map (subscriber), keep the
      // subscriber language preference — both come from the same person
      // anyway; either preference is acceptable.
      if (!byEmail.has(key)) {
        byEmail.set(key, {
          email: u.email,
          language: u.language === 'de' ? 'de' : 'en',
        });
      }
    }
  }

  return Array.from(byEmail.values());
}

/**
 * Broadcast a custom email to subscribers + users.
 *
 * Body:
 *   secret       — admin secret
 *   segment      — 'all' (default) | 'subscribers' | 'users'
 *   language     — 'all' (default) | 'en' | 'de'  (filter recipients)
 *   subject_en, subject_de   — subject line per language
 *   html_en,    html_de      — full HTML body per language (caller styles it)
 *   dryRun       — boolean (default false). If true, return the recipient
 *                  count broken down by language without sending.
 *
 * The endpoint paces sends with a short delay between requests to stay
 * inside Resend's 10/sec rate cap on paid tiers. Errors are tracked and
 * returned in the summary so partial failures are visible.
 */
router.post('/send', async (req: Request, res: Response) => {
  if (!checkAdminSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }

  const {
    segment = 'all',
    language = 'all',
    subject_en,
    subject_de,
    html_en,
    html_de,
    dryRun = false,
  } = req.body || {};

  if (!subject_en || !html_en || !subject_de || !html_de) {
    return res.status(400).json({
      success: false,
      message: 'Provide subject_en, subject_de, html_en, html_de — both languages required so each recipient gets their own.',
    });
  }

  const validSegments: Segment[] = ['all', 'subscribers', 'users'];
  if (!validSegments.includes(segment)) {
    return res.status(400).json({ success: false, message: `segment must be one of ${validSegments.join(', ')}` });
  }
  const validLangs: LangFilter[] = ['all', 'en', 'de'];
  if (!validLangs.includes(language)) {
    return res.status(400).json({ success: false, message: `language must be one of ${validLangs.join(', ')}` });
  }

  try {
    const recipients = await buildRecipients(segment, language);
    const byLang = recipients.reduce<Record<Lang, number>>((acc, r) => {
      acc[r.language] = (acc[r.language] ?? 0) + 1;
      return acc;
    }, { en: 0, de: 0 });

    if (dryRun) {
      return res.json({
        success: true,
        dryRun: true,
        segment,
        languageFilter: language,
        totalRecipients: recipients.length,
        byLanguage: byLang,
        sampleRecipients: recipients.slice(0, 5).map(r => ({ email: r.email.replace(/(.{2}).+(@.+)/, '$1***$2'), language: r.language })),
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      const result = await EmailService.sendBroadcast(r.email, r.language, {
        subject_en, subject_de, html_en, html_de,
      });
      if (result.success) sent += 1;
      else {
        failed += 1;
        if (errors.length < 10) errors.push(`${r.email}: ${result.error}`);
      }
      // Pace 120ms ≈ 8/sec to stay comfortably under Resend's rate cap.
      await new Promise(r => setTimeout(r, 120));
    }

    return res.json({
      success: true,
      dryRun: false,
      segment,
      languageFilter: language,
      totalRecipients: recipients.length,
      byLanguage: byLang,
      sent,
      failed,
      sampleErrors: errors,
    });
  } catch (err: any) {
    console.error('Broadcast failed:', err);
    return res.status(500).json({ success: false, message: err?.message ?? 'Broadcast failed' });
  }
});

export default router;
