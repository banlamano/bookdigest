import crypto from 'crypto';

/**
 * Build and verify HMAC-signed unsubscribe links so a recipient can't
 * unsubscribe someone else just by guessing their email address. The
 * token is the truncated HMAC of the lowercased email under a server
 * secret — short enough to fit in a URL, long enough that brute force
 * isn't practical.
 *
 * Secret falls back through UNSUBSCRIBE_SECRET → JWT_SECRET → a built-in
 * constant. The built-in is fine for booting locally; production should
 * have a real secret set.
 */
// Resolve secrets/URLs lazily so the values are read AFTER dotenv has
// populated process.env. Capturing at module-load time meant token
// generation in one process used a different secret than verification
// in another (e.g. CLI tests vs server when import order beat
// dotenv.config()).
function getSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.JWT_SECRET ||
    'bookdigest-unsubscribe-fallback-2026'
  );
}

function getSiteUrl(): string {
  return (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    'https://book-digest.com'
  );
}

function getApiUrl(): string {
  return (
    process.env.PUBLIC_API_URL ||
    process.env.API_URL ||
    'https://bookdigest-lypx.onrender.com'
  );
}

export function makeUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = makeUnsubscribeToken(email);
  // Constant-time compare to avoid leaking via timing.
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

/**
 * Build the full URL the recipient clicks. Points at the backend API so
 * we don't need a frontend route — the API renders an HTML confirmation
 * page directly.
 */
export function makeUnsubscribeUrl(email: string): string {
  const token = makeUnsubscribeToken(email);
  return `${getApiUrl()}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * The footer block that gets appended to every marketing email. Includes
 * the unsubscribe link and a short "why am I getting this" line.
 */
export function buildUnsubscribeFooter(email: string, language: 'en' | 'de'): string {
  const url = makeUnsubscribeUrl(email);
  const labels = language === 'de'
    ? {
        why: 'Du bekommst diese Mail, weil du dich bei BookDigest angemeldet hast.',
        unsubscribe: 'Vom Newsletter abmelden',
      }
    : {
        why: "You're getting this because you signed up at BookDigest.",
        unsubscribe: 'Unsubscribe',
      };
  return `
    <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px;">${labels.why}</p>
      <p style="margin: 0;">
        <a href="${url}" style="color: #6b7280; text-decoration: underline;">${labels.unsubscribe}</a>
      </p>
    </div>
  `;
}

/**
 * Inject the footer into an HTML body before </body>, or append to the
 * end if there's no </body> tag. Used by broadcast and any email that
 * needs the unsubscribe block but is built from caller-supplied HTML.
 */
export function injectUnsubscribeFooter(html: string, email: string, language: 'en' | 'de'): string {
  const footer = buildUnsubscribeFooter(email, language);
  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`);
  }
  return html + footer;
}

// Exported so route handlers can read the URL at request time, not at
// import time.
export { getSiteUrl };
