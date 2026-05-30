/**
 * Quick health-check on the email program. Pulls everything we track in
 * our own DB and prints it as a single overview — list size, language
 * mix, signup velocity, opt-out velocity.
 *
 *   npm run email:stats
 *
 * What this script CAN'T tell you (because Resend tracks it, not us):
 *   - Open rate / click rate           → resend.com/emails → Analytics
 *   - Bounce rate / spam complaints    → resend.com/emails → individual rows
 *   - Domain auth status (DKIM/SPF)    → resend.com/domains
 *   - Day-3/7/14/30 scheduled queue    → resend.com/emails → filter "scheduled"
 *
 * What this script CAN tell you (because we own it):
 *   - Reachable list size, with dedup
 *   - New signups in the last 24h / 7d / 30d
 *   - Opt-out velocity
 *   - Language preference distribution
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { prisma } from '../lib/prisma';

const HRS_IN_MS = 60 * 60 * 1000;
const DAY = 24 * HRS_IN_MS;

async function main() {
  const now = new Date();
  const t24h = new Date(now.getTime() - 1 * DAY);
  const t7d  = new Date(now.getTime() - 7 * DAY);
  const t30d = new Date(now.getTime() - 30 * DAY);

  // ─── Total list (deduped) ────────────────────────────────────────────
  const [allSubs, allUsers] = await Promise.all([
    prisma.emailSubscriber.findMany({
      select: { email: true, language: true, unsubscribedAt: true, createdAt: true },
    }),
    prisma.user.findMany({
      select: { email: true, language: true, unsubscribedAt: true, createdAt: true },
    }),
  ]);

  // Build the deduped reachable list — same email in both tables counts once.
  const reachable = new Map<string, { language: string; unsubscribedAt: Date | null }>();
  for (const s of allSubs) {
    reachable.set(s.email.toLowerCase(), { language: s.language, unsubscribedAt: s.unsubscribedAt });
  }
  for (const u of allUsers) {
    const key = u.email.toLowerCase();
    if (!reachable.has(key)) {
      reachable.set(key, { language: u.language, unsubscribedAt: u.unsubscribedAt });
    }
  }
  const reachableActive = [...reachable.values()].filter(r => !r.unsubscribedAt);

  // ─── Velocity ───────────────────────────────────────────────────────
  const cnt = async (table: 'emailSubscriber' | 'user', field: 'createdAt' | 'unsubscribedAt', since: Date) =>
    (prisma[table] as any).count({
      where: field === 'unsubscribedAt'
        ? { unsubscribedAt: { gte: since } }
        : { createdAt: { gte: since } },
    });

  const [
    subsSignup24h, subsSignup7d, subsSignup30d,
    userSignup24h, userSignup7d, userSignup30d,
    subsUnsub24h,  subsUnsub7d,  subsUnsub30d,
    userUnsub24h,  userUnsub7d,  userUnsub30d,
  ] = await Promise.all([
    cnt('emailSubscriber', 'createdAt', t24h),
    cnt('emailSubscriber', 'createdAt', t7d),
    cnt('emailSubscriber', 'createdAt', t30d),
    cnt('user', 'createdAt', t24h),
    cnt('user', 'createdAt', t7d),
    cnt('user', 'createdAt', t30d),
    cnt('emailSubscriber', 'unsubscribedAt', t24h),
    cnt('emailSubscriber', 'unsubscribedAt', t7d),
    cnt('emailSubscriber', 'unsubscribedAt', t30d),
    cnt('user', 'unsubscribedAt', t24h),
    cnt('user', 'unsubscribedAt', t7d),
    cnt('user', 'unsubscribedAt', t30d),
  ]);

  const langCounts = reachableActive.reduce<Record<string, number>>((acc, r) => {
    const k = r.language || 'en';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const subsUnsubTotal = allSubs.filter(s => s.unsubscribedAt).length;
  const userUnsubTotal = allUsers.filter(u => u.unsubscribedAt).length;

  // ─── Print ──────────────────────────────────────────────────────────
  const pad = (label: string, w = 32) => (label + ':').padEnd(w);
  const row = (label: string, ...values: (string | number)[]) =>
    console.log(`  ${pad(label)} ${values.map(v => String(v).padStart(8)).join('')}`);

  console.log(`\n📧 BookDigest email stats — ${now.toISOString().slice(0, 10)}\n`);

  console.log(`List size`);
  console.log(`─────────`);
  row('Newsletter subscribers (total)', allSubs.length);
  row('  → active', allSubs.length - subsUnsubTotal);
  row('  → unsubscribed', subsUnsubTotal);
  row('Registered users (total)', allUsers.length);
  row('  → active', allUsers.length - userUnsubTotal);
  row('  → unsubscribed', userUnsubTotal);
  row('Reachable (deduped, active)', reachableActive.length);

  console.log(`\nLanguage preference (active reachable)`);
  console.log(`──────────────────────────────────────`);
  for (const [lang, n] of Object.entries(langCounts).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round((n / reachableActive.length) * 100);
    row(`  ${lang.toUpperCase()}`, `${n} (${pct}%)`);
  }

  console.log(`\nSignup velocity`);
  console.log(`───────────────`);
  console.log(`  ${pad('Window', 32)}${'24h'.padStart(8)}${'7d'.padStart(8)}${'30d'.padStart(8)}`);
  row('Newsletter subscribers (new)', subsSignup24h, subsSignup7d, subsSignup30d);
  row('Registered users (new)', userSignup24h, userSignup7d, userSignup30d);

  console.log(`\nUnsubscribe velocity`);
  console.log(`────────────────────`);
  console.log(`  ${pad('Window', 32)}${'24h'.padStart(8)}${'7d'.padStart(8)}${'30d'.padStart(8)}`);
  row('Newsletter subscribers', subsUnsub24h, subsUnsub7d, subsUnsub30d);
  row('Registered users', userUnsub24h, userUnsub7d, userUnsub30d);

  console.log(`\n🔗 Resend tracks the delivery side:`);
  console.log(`   https://resend.com/emails              ← sends, deliveries, bounces, opens, clicks`);
  console.log(`   https://resend.com/domains             ← DKIM/SPF/DMARC status for book-digest.com`);
  console.log(``);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('email-stats failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
