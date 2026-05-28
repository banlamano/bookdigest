/**
 * Wire EN ↔ DE Brené Brown books so the auto-language-switch effect on the
 * book detail page actually fires for DE visitors. The mechanism (in
 * book.controller.ts findAlternate) looks up the DE row by:
 *     where: { language: 'de', originalTitle: EN.title }
 * so every DE row needs `originalTitle` set to its English title. All the
 * EN Brené Brown rows had `originalTitle: null` (no alternate found → no
 * redirect → DE user stuck on EN page).
 *
 * Notes:
 *   - cdbae34d (DE "Verletzlichkeit macht stark") is conceptually the
 *     translation of both EN "Daring Greatly" and EN "The Power of
 *     Vulnerability" (the audiobook). The schema only has one
 *     originalTitle, so we point it at "The Power of Vulnerability" —
 *     that's the page the user reported as broken. The proper "Daring
 *     Greatly" EN entry (e33bbd32) will not auto-redirect; a future fix
 *     would need an alias table.
 *   - 3e1058d1 (EN "The Power of Vulnerability") and cdbae34d already
 *     updated in a prior session — script is idempotent on those.
 */
import { prisma } from '../lib/prisma';

type Pair = { enId: string; deId: string; canonicalEnTitle: string };

const PAIRS: Pair[] = [
  // EN title set on the DE originalTitle — that's the linking key.
  { enId: '3e1058d1-3cdc-4694-b8e4-af3944125592', deId: 'cdbae34d-f14f-4720-a0db-49b53f585488', canonicalEnTitle: 'The Power of Vulnerability' },
  { enId: 'f74ee2e1-c53e-45eb-af04-0d22a3519f60', deId: '697786f7-0d8d-46a6-ae8b-f613b65c1c9c', canonicalEnTitle: 'Braving the Wilderness' },
  { enId: '9233c1e7',                             deId: '230e5366-fa3b-401a-9e06-cd82a8e5120d', canonicalEnTitle: 'Rising Strong' },
  { enId: 'a2459bbe',                             deId: 'db64c244',                             canonicalEnTitle: 'The Gifts of Imperfection' },
  { enId: '8e58ab3a',                             deId: 'd4fd5e40-377f-40be-b51d-c0c19212abf9', canonicalEnTitle: 'The Gifts of Imperfect Parenting' },
  { enId: '8f3761f2',                             deId: 'f86ec33c',                             canonicalEnTitle: 'Dare to Lead' },
];

async function resolveId(prefix: string): Promise<string | null> {
  if (prefix.length === 36) return prefix;
  // For short-prefix entries, look up the full UUID.
  const row = await prisma.book.findFirst({
    where: { id: { startsWith: prefix } },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function main() {
  console.log('=== Linking Brené Brown EN ↔ DE pairs ===\n');
  let linked = 0;
  let skipped = 0;
  for (const p of PAIRS) {
    const enId = await resolveId(p.enId);
    const deId = await resolveId(p.deId);
    if (!enId || !deId) {
      console.log(`  ⚠️  skipping ${p.canonicalEnTitle} — could not resolve IDs (en=${enId}, de=${deId})`);
      skipped += 1;
      continue;
    }

    // Set the DE row's originalTitle so the EN→DE lookup works.
    // Set the EN row's originalTitle to its own title so the DE→EN lookup
    // (where title: book.originalTitle || book.title) is consistent.
    await Promise.all([
      prisma.book.update({
        where: { id: deId },
        data: { originalTitle: p.canonicalEnTitle },
      }),
      prisma.book.update({
        where: { id: enId },
        data: { originalTitle: p.canonicalEnTitle },
      }),
    ]);
    console.log(`  ✅ ${p.canonicalEnTitle} → ${enId.slice(0,8)} ↔ ${deId.slice(0,8)}`);
    linked += 1;
  }
  console.log(`\nLinked ${linked} pair(s); ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Linking failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
