import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';
import { injectUnsubscribeFooter } from '../utils/unsubscribe';

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

type Recipient = { email: string; language: Lang; firstName?: string };

/**
 * Build the recipient list. Subscribers and registered users are unioned
 * and deduplicated by email (a user who also signed up via the popup gets
 * just one send). When the same person exists in both tables, prefer the
 * User's firstName over the subscriber's (more likely to have one set).
 */
async function buildRecipients(segment: Segment, langFilter: LangFilter): Promise<Recipient[]> {
  const byEmail = new Map<string, Recipient>();

  if (segment === 'all' || segment === 'subscribers') {
    const subs = await prisma.emailSubscriber.findMany({
      where: {
        unsubscribedAt: null,
        ...(langFilter !== 'all' ? { language: langFilter } : {}),
      },
      select: { email: true, language: true, firstName: true },
    });
    for (const s of subs) {
      byEmail.set(s.email.toLowerCase(), {
        email: s.email,
        language: (s.language === 'de' ? 'de' : 'en') as Lang,
        firstName: s.firstName?.trim() || undefined,
      });
    }
  }

  if (segment === 'all' || segment === 'users') {
    const users = await prisma.user.findMany({
      where: {
        unsubscribedAt: null,
        ...(langFilter !== 'all' ? { language: langFilter } : {}),
      },
      select: { email: true, language: true, firstName: true },
    });
    for (const u of users) {
      const key = u.email.toLowerCase();
      const existing = byEmail.get(key);
      if (existing) {
        // User row exists too — its firstName takes priority since the
        // registration form is more likely to capture it than the popup.
        if (u.firstName?.trim()) existing.firstName = u.firstName.trim();
      } else {
        byEmail.set(key, {
          email: u.email,
          language: (u.language === 'de' ? 'de' : 'en') as Lang,
          firstName: u.firstName?.trim() || undefined,
        });
      }
    }
  }

  return Array.from(byEmail.values());
}

/**
 * Replace {{name}} placeholder in broadcast HTML with the recipient's
 * first name (if known) or a friendly fallback. Senders write
 *   <p>Hi {{name}},</p>
 * in their HTML and the template produces:
 *   "Hi Erik," when the recipient has a saved name
 *   "Hi there," (EN) / "Hallo zusammen," (DE) when not
 */
function personalize(html: string, recipient: Recipient): string {
  const fallback = recipient.language === 'de' ? 'zusammen' : 'there';
  const name = recipient.firstName?.trim() || fallback;
  return html.replace(/\{\{\s*name\s*\}\}/g, name);
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
      // Personalise per recipient: {{name}} → firstName or friendly
      // fallback, then inject the HMAC'd unsubscribe footer.
      const personalizedHtmlEn = injectUnsubscribeFooter(personalize(html_en, r), r.email, 'en');
      const personalizedHtmlDe = injectUnsubscribeFooter(personalize(html_de, r), r.email, 'de');
      const result = await EmailService.sendBroadcast(r.email, r.language, {
        subject_en, subject_de,
        html_en: personalizedHtmlEn,
        html_de: personalizedHtmlDe,
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
