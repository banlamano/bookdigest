/**
 * Third email in the audio-content arc:
 *   Day 1 — "audio is 6× longer" announcement
 *   Day 2 — "what book do you want next?" question
 *   Day 3 — THIS: "first monthly batch landed, here's what's in it"
 *
 * Keep it tight. Three emails in three days is a lot — this one earns
 * its place by delivering on the question-mark email: people who asked
 * for a book might see it in the list.
 *
 *   npm run broadcast:audio-batch-1 -- --dry   # preview only
 *   npm run broadcast:audio-batch-1            # send for real
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
const API_URL =
  process.env.BROADCAST_API_URL ||
  'https://bookdigest-lypx.onrender.com';

const dryRun = process.argv.includes('--dry');

const subject_en = '30 more books got the new audio overnight 🎧';
const subject_de = '30 weitere Bücher haben über Nacht das neue Audio bekommen 🎧';

const styleBlock = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
    .titles { background: white; padding: 16px 20px; border-radius: 6px; margin: 16px 0; font-size: 14px; color: #4b5563; line-height: 1.8; border-left: 3px solid #2563eb; }
    .sign { color: #6b7280; margin-top: 24px; }
`;

const html_en = `
<!DOCTYPE html>
<html>
<head><style>${styleBlock}</style></head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Quick update: the first monthly batch of full-content audio just landed. <strong>30 more books</strong> now have the long-form narration (key insights, chapters, quotes, action items) instead of summary-only.</p>
      <p>A sample of what's new:</p>
      <div class="titles">
        Me Before You · After You · Still Me · The Book Thief · The Art of Racing in the Rain · And the Mountains Echoed · The Nightingale · Perennial Seller · The Monk Who Sold His Ferrari · The Unfair Advantage · The Little Book of Hygge · The Mastery of Love · The Immortal Life of Henrietta Lacks · The Man Who Mistook His Wife for a Hat
      </div>
      <p>That's 37 books on full audio now. The other ~180 land at 30/month over the rest of the year — all within Google's free tier.</p>
      <p>If you replied yesterday asking for a specific title, it'll get prioritised next batch. If you haven't told me yet — <strong>just reply with the title</strong>. Each reply moves a book up the queue.</p>
      <p class="sign">— Eric, BookDigest</p>
    </div>
  </div>
</body>
</html>
`;

const html_de = `
<!DOCTYPE html>
<html>
<head><style>${styleBlock}</style></head>
<body>
  <div class="container">
    <div class="content">
      <p>Hallo {{name}},</p>
      <p>Kurzes Update: Die erste monatliche Charge mit Full-Content-Audio ist da. <strong>30 weitere Bücher</strong> haben jetzt die lange Vertonung (wichtigste Erkenntnisse, Kapitel, Zitate, Handlungsempfehlungen) statt nur der Kurzfassung.</p>
      <p>Eine Auswahl, was neu ist:</p>
      <div class="titles">
        Ein ganz neues Leben · Mein Herz in zwei Welten · Du bist hier · Der Mönch, der seinen Ferrari verkaufte · Radical Candor · Schwierige Gespräche · Hygge · Remote · Der Rosie-Effekt · The Hard Thing About Hard Things · Eine Handvoll Sterne · Der Alchimist · Financial Freedom
      </div>
      <p>Macht 37 Bücher mit Full-Content-Audio. Die übrigen ~180 kommen über das restliche Jahr mit 30/Monat dazu — alles innerhalb von Googles kostenlosem Kontingent.</p>
      <p>Falls du gestern auf ein bestimmtes Buch geantwortet hast, kommt es in der nächsten Charge zuerst dran. Falls du mir noch nichts gesagt hast — <strong>antworte einfach mit dem Titel</strong>. Jede Antwort bewegt ein Buch nach oben.</p>
      <p class="sign">— Eric, BookDigest</p>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log(`📣 Audio-batch-1 broadcast`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no send)' : 'LIVE SEND'}`);
  console.log(`   API:  ${API_URL}/api/broadcast/send\n`);

  const body = {
    secret: ADMIN_SECRET,
    segment: 'all' as const,
    language: 'all' as const,
    subject_en,
    subject_de,
    html_en,
    html_de,
    dryRun,
  };

  const res = await fetch(`${API_URL}/api/broadcast/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    console.error('❌ Broadcast call failed:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('✅ Response:');
  console.log(JSON.stringify(data, null, 2));

  if (dryRun) {
    console.log('\nThis was a dry run — no emails were sent.');
    console.log('Re-run without --dry to fire for real.');
  } else {
    console.log(`\n📬 Sent to ${data.sent ?? '?'} recipients. ${data.failed ?? 0} failed.`);
  }
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
