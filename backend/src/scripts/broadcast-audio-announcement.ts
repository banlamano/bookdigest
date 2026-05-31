/**
 * Fire the "full-content audio is live" broadcast to the whole list.
 *
 *   npm run broadcast:audio-announcement -- --dry     # show recipient count, send nothing
 *   npm run broadcast:audio-announcement              # actually fires
 *
 * Reads ADMIN_SECRET from env. Reads broadcast API URL from
 * BROADCAST_API_URL or defaults to prod. Subject + HTML are inline in
 * both EN and DE — the backend picks the right one per recipient.
 *
 * Safe to re-run for dry-runs. Re-running a real send will re-email
 * everyone — there's no idempotency layer on the broadcast endpoint yet.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
const API_URL =
  process.env.BROADCAST_API_URL ||
  'https://bookdigest-lypx.onrender.com';

const dryRun = process.argv.includes('--dry');

const subject_en = 'Your audio summaries just got 6× longer 🎧';
const subject_de = 'Eure Audio-Zusammenfassungen sind jetzt 6× länger 🎧';

const styleBlock = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .compare { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; }
    .row strong { color: #1e40af; }
    .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
`;

const html_en = `
<!DOCTYPE html>
<html>
<head><style>${styleBlock}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>🎧 Real audio just got real</h1></div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Quick note about something we shipped this week: BookDigest audio now narrates the <strong>complete</strong> summary — not just the intro.</p>
      <p>Until now, the audio for each book covered the long-form summary (~5 minutes). That left out the parts readers actually quote later: the key insights, chapter-by-chapter breakdown, memorable quotes, and action items.</p>
      <p>Now it covers all of them.</p>

      <div class="compare">
        <div class="row"><span>Atomic Habits, before</span><strong>5 minutes</strong></div>
        <div class="row"><span>Atomic Habits, after</span><strong>38 minutes</strong></div>
      </div>

      <p>Same book, ~6× the content. Same Google Neural2 voice — natural enough to listen to on a walk.</p>

      <p style="text-align: center;">
        <a href="https://book-digest.com/books/atomic-habits-james-clear" class="button">Listen to Atomic Habits →</a>
      </p>

      <p>We're refreshing ~30 books per month within Google's free tier, so the whole catalog gets covered in ~7 months. Most-read books go first.</p>

      <p>Hit reply with the book you most want next. We'll prioritize it.</p>

      <p>— Eric, BookDigest</p>
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
    <div class="header"><h1>🎧 Echtes Audio wird jetzt richtig</h1></div>
    <div class="content">
      <p>Hallo {{name}},</p>
      <p>Kurze Notiz zu etwas, das wir diese Woche ausgeliefert haben: BookDigest-Audio liest jetzt die <strong>komplette</strong> Zusammenfassung vor — nicht nur den Einstieg.</p>
      <p>Bisher deckte das Audio die ausführliche Zusammenfassung ab (~5 Minuten). Damit fehlten die Teile, die Leser später am häufigsten zitieren: die wichtigsten Erkenntnisse, die Kapitel-für-Kapitel-Aufschlüsselung, einprägsame Zitate und Handlungsempfehlungen.</p>
      <p>Jetzt sind alle dabei.</p>

      <div class="compare">
        <div class="row"><span>Verletzlichkeit macht stark, vorher</span><strong>5 Minuten</strong></div>
        <div class="row"><span>Verletzlichkeit macht stark, nachher</span><strong>38 Minuten</strong></div>
      </div>

      <p>Gleiches Buch, ~6× so viel Inhalt. Gleiche Google-Neural2-Stimme — natürlich genug zum Hören beim Spaziergang.</p>

      <p style="text-align: center;">
        <a href="https://book-digest.com/books/verletzlichkeit-macht-stark-wie-wir-mutig-leben-lieben-und-fuehren-koennen-bren-brown" class="button">"Verletzlichkeit macht stark" anhören →</a>
      </p>

      <p>Wir frischen ~30 Bücher pro Monat über Googles kostenloses Kontingent auf — der ganze Katalog dauert also ~7 Monate. Die meistgelesenen Bücher kommen zuerst.</p>

      <p>Antworte mit dem Buch, das du am meisten haben willst. Wir priorisieren es.</p>

      <p>— Eric, BookDigest</p>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log(`📣 Audio-announcement broadcast`);
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
