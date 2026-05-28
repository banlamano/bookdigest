/**
 * One-shot cleanup for the German Brené Brown catalog.
 *
 * Problems found (2026-05-28):
 *   - c5b898f1 "Die Kraft der Verletzlichkeit" — wrong cover (showed Gifts of
 *     Imperfection); summary actually describes Daring Greatly. Duplicate of
 *     cdbae34d which has the correct Daring Greatly content.
 *   - 230e5366 titled "Verletzlichkeit macht stark: ...Krisen meistern..." but
 *     the summary is for Rising Strong. Correct DE title: "Laufen lernt man
 *     nur durch Hinfallen".
 *   - 697786f7 titled "Verletzlichkeit macht stark: ...den Mut aufbringen..."
 *     but the summary is for Braving the Wilderness. Correct DE title:
 *     "Die Kraft der Zugehörigkeit".
 *   - cdbae34d "Verletzlichkeit macht stark: ...mutig leben, lieben und
 *     führen können" — title + summary both correct, kept as canonical.
 *
 * Action plan:
 *   1. Migrate any user reading data from c5b898f1 → cdbae34d (then delete).
 *   2. Rename 230e5366 + 697786f7, regenerate slugs, blank covers (so the
 *      frontend placeholder shows instead of the wrong shared cover).
 *      Audio will need separate regeneration since the narration includes
 *      the title.
 */
import { prisma } from '../lib/prisma';

const DUPE_ID = 'c5b898f1-df7c-451d-9234-2d09f41f7d30';      // delete
const KEEP_ID = 'cdbae34d-f14f-4720-a0db-49b53f585488';      // canonical Daring Greatly

const renames = [
  {
    id: '230e5366-fa3b-401a-9e06-cd82a8e5120d',
    newTitle: 'Laufen lernt man nur durch Hinfallen',
    newSlug:  'laufen-lernt-man-nur-durch-hinfallen-bren-brown',
    actualSource: 'Rising Strong',
  },
  {
    id: '697786f7-0d8d-46a6-ae8b-f613b65c1c9c',
    newTitle: 'Die Kraft der Zugehörigkeit',
    newSlug:  'die-kraft-der-zugehoerigkeit-bren-brown',
    actualSource: 'Braving the Wilderness',
  },
];

async function migrateReadingProgress() {
  const rows = await prisma.readingProgress.findMany({ where: { bookId: DUPE_ID } });
  console.log(`Migrating ${rows.length} ReadingProgress row(s) ${DUPE_ID.slice(0,8)} → ${KEEP_ID.slice(0,8)}`);

  for (const row of rows) {
    const existing = await prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId: row.userId, bookId: KEEP_ID } },
    });

    if (existing) {
      // User already has progress on the canonical entry. Keep the more
      // advanced of the two — if the dupe's progress is further along,
      // copy the larger values into the canonical row. Then drop the dupe.
      await prisma.readingProgress.update({
        where: { id: existing.id },
        data: {
          progress: Math.max(existing.progress, row.progress),
          currentChapter: Math.max(existing.currentChapter, row.currentChapter),
          audioProgress: Math.max(existing.audioProgress, row.audioProgress),
          timeSpent: existing.timeSpent + row.timeSpent,
          isCompleted: Math.max(existing.isCompleted, row.isCompleted),
          completedAt: existing.completedAt || row.completedAt,
        },
      });
      await prisma.readingProgress.delete({ where: { id: row.id } });
      console.log(`  user ${row.userId.slice(0,8)}: merged into existing canonical row`);
    } else {
      // No conflict — just repoint the row.
      await prisma.readingProgress.update({
        where: { id: row.id },
        data: { bookId: KEEP_ID },
      });
      console.log(`  user ${row.userId.slice(0,8)}: repointed`);
    }
  }
}

async function migrateFavoritesAndHistory() {
  // Favorites: same userId+bookId unique constraint, handle collision.
  const favs = await prisma.favorite.findMany({ where: { bookId: DUPE_ID } });
  for (const f of favs) {
    const exists = await prisma.favorite.findUnique({
      where: { userId_bookId: { userId: f.userId, bookId: KEEP_ID } },
    });
    if (exists) {
      await prisma.favorite.delete({ where: { id: f.id } });
    } else {
      await prisma.favorite.update({ where: { id: f.id }, data: { bookId: KEEP_ID } });
    }
  }
  if (favs.length > 0) console.log(`Migrated ${favs.length} Favorite row(s)`);

  // ReadingHistory has no unique constraint, just repoint.
  const history = await prisma.readingHistory.updateMany({
    where: { bookId: DUPE_ID },
    data: { bookId: KEEP_ID },
  });
  if (history.count > 0) console.log(`Migrated ${history.count} ReadingHistory row(s)`);

  const reviews = await prisma.review.updateMany({
    where: { bookId: DUPE_ID },
    data: { bookId: KEEP_ID },
  });
  if (reviews.count > 0) console.log(`Migrated ${reviews.count} Review row(s)`);
}

async function renameMislabeled() {
  for (const r of renames) {
    // Make sure new slug isn't already taken by some other book.
    const collision = await prisma.book.findFirst({
      where: { slug: r.newSlug, NOT: { id: r.id } },
      select: { id: true, title: true },
    });
    if (collision) {
      console.error(`  Slug collision for ${r.newSlug} → existing book ${collision.id} "${collision.title}". Skipping rename of ${r.id}.`);
      continue;
    }

    await prisma.book.update({
      where: { id: r.id },
      data: {
        title: r.newTitle,
        slug: r.newSlug,
        // Blank the cover — current cover is the Daring Greatly cover (wrong
        // for these two books). Frontend will show its placeholder; can be
        // re-assigned via admin later.
        coverImage: '',
        // Audio narrates the title at the top — must be regenerated. Clear
        // the URL so the player falls back to the browser TTS until the new
        // R2 audio is uploaded by generate-audio-google.
        audioUrl: null,
        audioDuration: null,
      },
    });
    console.log(`  Renamed ${r.id.slice(0,8)} → "${r.newTitle}" (source: ${r.actualSource}); cover + audio cleared`);
  }
}

async function deleteDupe() {
  await prisma.book.delete({ where: { id: DUPE_ID } });
  console.log(`Deleted duplicate ${DUPE_ID.slice(0,8)} "Die Kraft der Verletzlichkeit"`);
}

async function main() {
  console.log('=== Brené Brown DE catalog cleanup ===\n');

  console.log('Step 1: Migrate user data from duplicate to canonical');
  await migrateReadingProgress();
  await migrateFavoritesAndHistory();

  console.log('\nStep 2: Delete the duplicate');
  await deleteDupe();

  console.log('\nStep 3: Rename the mislabeled books');
  await renameMislabeled();

  console.log('\n✅ Cleanup complete.');
  console.log('Next steps (manual):');
  console.log('  1. Run `npx tsx src/scripts/generate-audio-google.ts` to regen audio for the 2 renamed books');
  console.log('  2. Assign proper covers via admin UI (or update with correct Google Books volume IDs)');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Cleanup failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
