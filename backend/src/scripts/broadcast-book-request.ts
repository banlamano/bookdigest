/**
 * Short follow-up to the audio announcement. Two purposes:
 *
 *   1. Verify {{name}} personalisation works end-to-end (recipients see
 *      "Hi Erik," instead of yesterday's "Hi,")
 *   2. Gather real user signal — ask what books they want next, so the
 *      monthly `next=30` audio walker can prioritise requests over the
 *      default reading-count ordering
 *
 * Use the same broadcast pipeline as the audio announcement; the only
 * differences are subject + body. Reads ADMIN_SECRET from .env. Pace
 * spacing handled by the backend at 8/sec.
 *
 *   npm run broadcast:book-request -- --dry   # preview only
 *   npm run broadcast:book-request            # send for real
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
const API_URL =
  process.env.BROADCAST_API_URL ||
  'https://bookdigest-lypx.onrender.com';

const dryRun = process.argv.includes('--dry');

const subject_en = 'Quick question — which book next? 📚';
const subject_de = 'Kurze Frage — welches Buch als Nächstes? 📚';

const styleBlock = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
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
      <p>Quick follow-up to yesterday's email about the new full-content audio.</p>
      <p>Status: <strong>7 books</strong> have the new audio so far. The rest get added <strong>30 per month</strong> within Google's free tier — so the whole catalog gets there in ~7 months. Most-read books go first.</p>
      <p>One question that'd help me a lot: <strong>which book do you want to see next?</strong> Reply with any title — could be a book that already has summary text and you want it on audio, or a book we don't have at all.</p>
      <p>I read every reply and prioritise the requests over the default ordering.</p>
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
      <p>Kurzes Follow-up zu meiner Mail von gestern über das neue Full-Content-Audio.</p>
      <p>Stand: <strong>7 Bücher</strong> haben das neue Audio. Die restlichen kommen mit <strong>30 pro Monat</strong> dazu, innerhalb von Googles kostenlosem Kontingent — der ganze Katalog ist also in ~7 Monaten fertig. Die meistgelesenen Bücher kommen zuerst.</p>
      <p>Eine Frage, die mir sehr hilft: <strong>Von welchem Buch möchtest du als Nächstes eine Audio-Zusammenfassung?</strong> Antworte mit einem beliebigen Titel — kann ein Buch sein, das schon eine Zusammenfassung hat und du es als Audio möchtest, oder eins, das wir gar nicht haben.</p>
      <p>Ich lese jede Antwort und priorisiere die Wünsche über die Standardreihenfolge.</p>
      <p class="sign">— Eric, BookDigest</p>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log(`📣 Book-request broadcast`);
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
