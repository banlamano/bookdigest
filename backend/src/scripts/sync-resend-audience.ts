/**
 * One-shot backfill: walk every active subscriber + user and upsert them
 * into the matching Resend Audience. Idempotent — safe to re-run any time
 * to reconcile the dashboard with your DB.
 *
 *   npm run resend:sync-audience          # syncs everything
 *   npm run resend:sync-audience -- --dry # preview only, no API calls
 *
 * Prerequisites:
 *   1. Create the two Audiences in Resend's dashboard
 *      (Audience tab → "+ New audience" or similar)
 *   2. Set RESEND_AUDIENCE_EN_ID and RESEND_AUDIENCE_DE_ID in .env
 *
 * Script gracefully no-ops with a clear warning if either env var is
 * missing.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { prisma } from '../lib/prisma';
import { syncContact, SyncContact } from '../services/resend-audience.service';

const dryRun = process.argv.includes('--dry');

type DedupedContact = SyncContact & { source: string };

async function buildContactList(): Promise<DedupedContact[]> {
  const [subs, users] = await Promise.all([
    prisma.emailSubscriber.findMany({
      select: { email: true, language: true, unsubscribedAt: true },
    }),
    prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true, language: true, unsubscribedAt: true },
    }),
  ]);

  const map = new Map<string, DedupedContact>();

  for (const s of subs) {
    map.set(s.email.toLowerCase(), {
      email: s.email,
      language: (s.language === 'de' ? 'de' : 'en') as 'en' | 'de',
      unsubscribed: !!s.unsubscribedAt,
      source: 'subscriber',
    });
  }

  for (const u of users) {
    const key = u.email.toLowerCase();
    const existing = map.get(key);
    map.set(key, {
      email: u.email,
      firstName: u.firstName ?? existing?.firstName,
      lastName: u.lastName ?? existing?.lastName,
      language: (existing?.language || (u.language === 'de' ? 'de' : 'en')) as 'en' | 'de',
      // Either source unsubscribed → propagate
      unsubscribed: (existing?.unsubscribed ?? false) || !!u.unsubscribedAt,
      source: existing ? 'both' : 'user',
    });
  }

  return [...map.values()];
}

async function main() {
  console.log(`📋 Resend Audience sync — ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  const enId = process.env.RESEND_AUDIENCE_EN_ID;
  const deId = process.env.RESEND_AUDIENCE_DE_ID;
  if (!enId || !deId) {
    console.log(`⚠️  Missing env var(s):`);
    if (!enId) console.log(`     RESEND_AUDIENCE_EN_ID`);
    if (!deId) console.log(`     RESEND_AUDIENCE_DE_ID`);
    console.log(`\nCreate the Audiences in Resend's dashboard, then set both IDs.\n`);
    if (!dryRun) process.exit(1);
  }

  const contacts = await buildContactList();

  const byLang = contacts.reduce<Record<'en' | 'de', number>>(
    (acc, c) => { acc[c.language] += 1; return acc; },
    { en: 0, de: 0 },
  );
  const unsubCount = contacts.filter(c => c.unsubscribed).length;

  console.log(`Total reachable: ${contacts.length}`);
  console.log(`  EN: ${byLang.en}`);
  console.log(`  DE: ${byLang.de}`);
  console.log(`  Unsubscribed (will be marked as such): ${unsubCount}\n`);

  if (dryRun) {
    console.log(`Dry run — no API calls made.`);
    console.log(`Sample contacts:`);
    for (const c of contacts.slice(0, 5)) {
      const mask = c.email.replace(/(.{2}).+(@.+)/, '$1***$2');
      console.log(`  ${mask} [${c.language}] ${c.firstName ? '(' + c.firstName + ')' : ''} ${c.unsubscribed ? '(unsubscribed)' : ''}`);
    }
    await prisma.$disconnect();
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
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
    // Pace ~5/sec to be polite to Resend's API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✨ Sync complete:`);
  console.log(`   Created:  ${created}`);
  console.log(`   Updated:  ${updated}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Failed:   ${failed}`);
  if (errors.length > 0) {
    console.log(`\nFirst ${errors.length} errors:`);
    errors.forEach(e => console.log(`   ${e}`));
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Sync failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
