import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyUnsubscribeToken, getSiteUrl } from '../utils/unsubscribe';
import { markUnsubscribed } from '../services/resend-audience.service';

const router = Router();

type Lang = 'en' | 'de';

/**
 * Render a small inline HTML page so we don't need a frontend route for
 * the unsubscribe confirmation. Keeps the flow one URL → one page.
 */
function renderPage(opts: {
  title: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${opts.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f9fafb; color: #111827; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 12px; }
    .icon { font-size: 48px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${opts.title.startsWith('Error') ? '⚠️' : '✉️'}</div>
    <h1>${opts.heading}</h1>
    <p>${opts.body}</p>
    <a href="${opts.ctaHref}" class="button">${opts.ctaLabel}</a>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Detect requested language: explicit ?lang= wins, then Accept-Language
 * header sniff. Default English.
 */
function detectLang(req: Request): Lang {
  const q = (req.query.lang as string | undefined)?.toLowerCase();
  if (q === 'de' || q === 'en') return q;
  const accept = (req.header('Accept-Language') || '').toLowerCase();
  if (accept.startsWith('de')) return 'de';
  return 'en';
}

/**
 * Unsubscribe handler. One-click GET — recipient clicks link, we verify
 * the HMAC token, mark both User and EmailSubscriber rows (whichever
 * exist for that email) as unsubscribed, and render a confirmation page.
 *
 * One-click is OK for this audience: email-client prefetchers generally
 * don't prefetch unsubscribe links (Gmail, Outlook respect List-Unsubscribe
 * conventions). If accidental unsubscribes ever become an issue we can
 * switch to a confirm-button two-step.
 */
router.get('/', async (req: Request, res: Response) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';
  const lang = detectLang(req);

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    const labels = lang === 'de'
      ? {
          title: 'Error',
          heading: 'Ungültiger Link',
          body: 'Dieser Abmelde-Link ist abgelaufen oder ungültig. Bitte verwende den Link aus deiner letzten E-Mail oder kontaktiere uns.',
          cta: 'Zurück zur Startseite',
        }
      : {
          title: 'Error — Invalid link',
          heading: 'Invalid link',
          body: "This unsubscribe link is expired or invalid. Please use the link from your most recent email, or contact us.",
          cta: 'Back to BookDigest',
        };
    return res.status(400).send(
      renderPage({
        title: labels.title,
        heading: labels.heading,
        body: labels.body,
        ctaLabel: labels.cta,
        ctaHref: getSiteUrl(),
      })
    );
  }

  const normalized = email.toLowerCase();
  const now = new Date();

  try {
    // Read the saved language BEFORE updating so we know which Resend
    // Audience to mark unsubscribed. Subscriber's language wins if both
    // rows exist — usually they're the same person anyway.
    const [subRow, userRow] = await Promise.all([
      prisma.emailSubscriber.findUnique({ where: { email: normalized }, select: { language: true } }),
      prisma.user.findUnique({ where: { email: normalized }, select: { language: true } }),
    ]);
    const savedLang: 'en' | 'de' =
      (subRow?.language === 'de' || userRow?.language === 'de') ? 'de' : 'en';

    const [subResult, userResult] = await Promise.all([
      prisma.emailSubscriber.updateMany({
        where: { email: normalized, unsubscribedAt: null },
        data: { unsubscribedAt: now },
      }),
      prisma.user.updateMany({
        where: { email: normalized, unsubscribedAt: null },
        data: { unsubscribedAt: now },
      }),
    ]);

    const touched = subResult.count + userResult.count;
    console.log(`📭 Unsubscribed ${email} (${touched} row(s) updated, lang=${lang})`);

    // Mirror the unsubscribe into the saved-language Resend Audience.
    // Fire-and-forget; no-ops if audience IDs aren't configured.
    void markUnsubscribed(normalized, savedLang).catch(err =>
      console.error('Resend audience unsubscribe sync failed:', err)
    );

    const labels = lang === 'de'
      ? {
          title: 'Abgemeldet',
          heading: 'Du bist abgemeldet ✉️',
          body: `${email} bekommt keine Marketing-Mails mehr von BookDigest. Wichtige Mails wie Passwort-Zurücksetzungen und Zahlungsbestätigungen kommen weiterhin.`,
          cta: 'Zurück zu BookDigest',
        }
      : {
          title: 'Unsubscribed',
          heading: "You're unsubscribed ✉️",
          body: `${email} won't receive marketing emails from BookDigest anymore. Important emails like password resets and payment receipts will still come through.`,
          cta: 'Back to BookDigest',
        };

    return res.send(
      renderPage({
        title: labels.title,
        heading: labels.heading,
        body: labels.body,
        ctaLabel: labels.cta,
        ctaHref: getSiteUrl(),
      })
    );
  } catch (err: any) {
    console.error('Unsubscribe DB error:', err);
    return res.status(500).send(
      renderPage({
        title: 'Error',
        heading: 'Something went wrong',
        body: "We couldn't process your unsubscribe just now. Please try again in a moment, or reply to any email and we'll do it manually.",
        ctaLabel: 'Back to BookDigest',
        ctaHref: getSiteUrl(),
      })
    );
  }
});

export default router;
