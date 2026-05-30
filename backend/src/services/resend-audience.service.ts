/**
 * One-way sync from our DB → Resend Audiences. Keeps the Resend dashboard's
 * Audience tab populated so the user can see list size and (optionally) use
 * Resend's UI to send broadcasts.
 *
 * Two Audiences split by language:
 *   - RESEND_AUDIENCE_EN_ID  — for users + subscribers with language='en'
 *   - RESEND_AUDIENCE_DE_ID  — for users + subscribers with language='de'
 *
 * Defensive design — if either env var is unset, the corresponding sync
 * silently no-ops. The system never blocks a signup or unsubscribe on a
 * Resend audience failure; all calls are fire-and-forget from the
 * controller side.
 */
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Read env at call time (not module load) so dotenv ordering doesn't
 * silently break the lookup the way it did for the unsubscribe secret.
 */
function getAudienceId(language: 'en' | 'de'): string | null {
  if (language === 'de') return process.env.RESEND_AUDIENCE_DE_ID || null;
  return process.env.RESEND_AUDIENCE_EN_ID || null;
}

export type SyncContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  language: 'en' | 'de';
  unsubscribed?: boolean;
};

export type SyncResult = {
  ok: boolean;
  action: 'created' | 'updated' | 'skipped' | 'failed';
  error?: string;
};

/**
 * Upsert a contact into the language-matched Resend Audience. Tries to
 * create first; on "already exists" error, falls back to update.
 *
 * Returns `skipped` (with reason) when API key or audience ID is missing
 * — that's the no-op path for unconfigured environments.
 */
export async function syncContact(contact: SyncContact): Promise<SyncResult> {
  if (!resend) return { ok: false, action: 'skipped', error: 'RESEND_API_KEY not set' };
  const audienceId = getAudienceId(contact.language);
  if (!audienceId) return { ok: false, action: 'skipped', error: `RESEND_AUDIENCE_${contact.language.toUpperCase()}_ID not set` };

  const body = {
    audienceId,
    email: contact.email.toLowerCase(),
    firstName: contact.firstName?.trim() || undefined,
    lastName: contact.lastName?.trim() || undefined,
    unsubscribed: contact.unsubscribed ?? false,
  };

  try {
    const created = await resend.contacts.create(body);
    if (!created.error) {
      return { ok: true, action: 'created' };
    }
    // Already exists → switch to update path. Resend's error message text
    // is the only reliable signal here; the SDK doesn't expose a code.
    const msg = String(created.error.message || '').toLowerCase();
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      try {
        const updated = await resend.contacts.update(body);
        if (updated.error) {
          return { ok: false, action: 'failed', error: `${updated.error.name}: ${updated.error.message}` };
        }
        return { ok: true, action: 'updated' };
      } catch (err: any) {
        return { ok: false, action: 'failed', error: err?.message ?? String(err) };
      }
    }
    return { ok: false, action: 'failed', error: `${created.error.name}: ${created.error.message}` };
  } catch (err: any) {
    return { ok: false, action: 'failed', error: err?.message ?? String(err) };
  }
}

/**
 * Mark a contact unsubscribed in their language audience. Used by the
 * GET /api/unsubscribe route after marking the row in our DB.
 */
export async function markUnsubscribed(email: string, language: 'en' | 'de'): Promise<SyncResult> {
  return syncContact({ email, language, unsubscribed: true });
}
