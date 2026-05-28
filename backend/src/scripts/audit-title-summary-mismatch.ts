/**
 * Read-only audit: find books where the DB title doesn't match the source
 * book(s) referenced in the AI-generated summary.
 *
 * Background: the German Brené Brown catalog had 3 books labeled with
 * incorrect or swapped German titles — the title metadata said one book
 * but the summary text actually described a different book. This script
 * scans the catalog for the same pattern across all authors.
 *
 * Heuristic:
 *   1. Extract quoted titles from the summary's first ~800 chars using the
 *      typographic-quote patterns AI summaries consistently use:
 *        „Title"   (German low-9 + right-double, most common)
 *        "Title"   (curly double)
 *        "Title"   (straight)
 *        « Title » (French, occasional)
 *   2. The first 1–3 quoted phrases are almost always the source-book
 *      title(s) (original English title, German translation, alternates).
 *   3. If NONE of those quoted phrases overlaps the DB title (after
 *      normalization), flag the book as suspicious.
 *
 * The script is read-only — produces a report, no DB writes. Run with:
 *   npx tsx src/scripts/audit-title-summary-mismatch.ts          # all books
 *   npx tsx src/scripts/audit-title-summary-mismatch.ts lang=de  # DE only
 */
import { prisma } from '../lib/prisma';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractQuotedTitles(text: string): string[] {
  const head = text.slice(0, 1000);
  // Quote-character variants observed in the AI-generated summaries:
  //   U+201E „ (German low-9 opening), U+201C " (left double, also used as closer by some models),
  //   U+201D " (right double, traditional German closer), U+00AB « / U+00BB »,
  //   ASCII straight " (rare).
  // Build the patterns out of \u escapes so editor/tool normalization can't
  // silently flatten smart quotes to ASCII.
  const OPEN_LOW9 = '„';   // „
  const LDQ       = '“';   // "
  const RDQ       = '”';   // "
  const LAB       = '«';   // «
  const RAB       = '»';   // »
  // Closer class: accept either LDQ or RDQ (some models emit LDQ on both sides).
  const closer = `[${LDQ}${RDQ}]`;

  const patterns = [
    new RegExp(`${OPEN_LOW9}([^${LDQ}${RDQ}]{3,80})${closer}`, 'g'),  // „…"
    new RegExp(`${LDQ}([^${LDQ}${RDQ}]{3,80})${RDQ}`, 'g'),           // "…"
    new RegExp(`${LAB}\\s*([^${RAB}]{3,80})\\s*${RAB}`, 'g'),         // «…»
    /"([^"]{3,80})"/g,                                                // "…" ASCII
  ];
  const out: string[] = [];
  for (const pat of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(head)) !== null) {
      out.push(m[1].trim());
    }
  }
  // Keep the first 5 — anything beyond that is usually quoted concepts, not titles
  return out.slice(0, 5);
}

/**
 * Heuristic: does the quoted phrase look like an English book title?
 * Common signals: contains stop-words "the/of/and/a/an/to/is/in/for", or
 * majority of significant tokens are recognisably English.
 *
 * Used to filter out cases where the AI summary cites the original English
 * title alongside the German DB title — not a mismatch, just bilingual
 * context.
 */
function looksEnglishTitle(s: string): boolean {
  const lower = ` ${s.toLowerCase()} `;
  const englishStops = [' the ', ' of ', ' and ', ' a ', ' an ', ' to ', ' is ', ' in ', ' for ', ' your ', ' you '];
  if (englishStops.some(w => lower.includes(w))) return true;
  // Heuristic: if any short word is English-only and German-rare
  const englishMarkers = ['startup', 'mindset', 'business', 'leadership', 'happiness', 'killer', 'badass'];
  if (englishMarkers.some(w => lower.includes(' ' + w + ' ') || lower.endsWith(w + ' '))) return true;
  return false;
}

/**
 * Token-overlap check: at least 50% of the DB-title's significant tokens
 * (length >= 4) must appear in the quoted phrase, OR the quoted phrase
 * must appear inside the DB title (substring match after normalization).
 * Returns true if there's a reasonable match.
 */
function titleAppearsToMatch(dbTitle: string, quoted: string): boolean {
  const a = normalize(dbTitle);
  const b = normalize(quoted);
  if (a.includes(b) || b.includes(a)) return true;
  const aTokens = a.split(' ').filter(t => t.length >= 4);
  if (aTokens.length === 0) return false;
  const bSet = new Set(b.split(' '));
  const hits = aTokens.filter(t => bSet.has(t)).length;
  return hits / aTokens.length >= 0.5;
}

/**
 * Confidence score for a mismatch. Returns 0–1:
 *   1.0 → quoted phrase shares 0% of DB title's significant tokens
 *   0.0 → quoted phrase shares all DB title's significant tokens
 * Picks the BEST (most-disjoint) candidate as the canonical signal.
 */
function scoreDisjoint(dbTitle: string, quoted: string[]): number {
  const a = normalize(dbTitle);
  const aTokens = a.split(' ').filter(t => t.length >= 4);
  if (aTokens.length === 0) return 0;
  let best = 0;
  for (const q of quoted) {
    const bSet = new Set(normalize(q).split(' '));
    const hits = aTokens.filter(t => bSet.has(t)).length;
    const disjoint = 1 - hits / aTokens.length;
    if (disjoint > best) best = disjoint;
  }
  return best;
}

async function main() {
  const langArg = process.argv.find(a => a.startsWith('lang='));
  const language = langArg ? langArg.slice(5) : undefined;

  const books = await prisma.book.findMany({
    where: { summary: { not: '' }, ...(language ? { language } : {}) },
    select: { id: true, title: true, author: true, language: true, summary: true, slug: true },
  });

  console.log(`=== Title↔Summary mismatch audit ===`);
  console.log(`Scanning ${books.length} book(s)${language ? ` (lang=${language})` : ''}\n`);

  const suspect: Array<{
    id: string;
    title: string;
    author: string;
    language: string;
    quotedTitles: string[];
  }> = [];

  type Hit = { id: string; title: string; author: string; language: string; quotedTitles: string[]; score: number };
  const allHits: Hit[] = [];

  for (const b of books) {
    const quoted = extractQuotedTitles(b.summary);
    if (quoted.length === 0) continue;

    const candidates = quoted.filter(q =>
      q.length >= 15 &&                // raised from 10 — short phrases are noise
      !looksEnglishTitle(q) &&         // original-title citation, not a bug
      !titleAppearsToMatch(b.title, q) // overlaps DB title → same book paraphrased
    );

    if (candidates.length === 0) continue;

    // Confidence score: highest = quoted phrase shares NONE of the DB title's
    // significant tokens. The Brené Brown bug pattern (Rising Strong vs.
    // Verletzlichkeit macht stark) maxes this score; alternate-translation
    // false positives (Die effektive Führungskraft vs. Der wirksame Manager)
    // score lower because both share "manager"/"führung" semantic territory
    // — but tokens may still be disjoint here. Best signal we have without
    // an LLM call.
    const score = scoreDisjoint(b.title, candidates);
    allHits.push({
      id: b.id,
      title: b.title,
      author: b.author,
      language: b.language,
      quotedTitles: candidates,
      score,
    });
  }

  // Sort by score desc; cap to top N by default so the report is reviewable.
  allHits.sort((a, b) => b.score - a.score);
  const topN = parseInt(process.argv.find(a => a.startsWith('top='))?.slice(4) || '25', 10);
  suspect.push(...allHits.slice(0, topN).map(h => ({ id: h.id, title: h.title, author: h.author, language: h.language, quotedTitles: h.quotedTitles })));

  console.log(`\nNoise note: total candidates after filtering = ${allHits.length}`);
  console.log(`Showing top ${suspect.length} by confidence score (most disjoint titles first).`);
  console.log(`Run with top=<N> to expand.\n`);

  if (suspect.length === 0) {
    console.log('✅ No mismatches detected.');
    await prisma.$disconnect();
    return;
  }

  console.log(`⚠️  ${suspect.length} suspect book(s):\n`);
  for (const s of suspect) {
    console.log(`  ID: ${s.id.slice(0, 8)} [${s.language}]`);
    console.log(`  Author: ${s.author}`);
    console.log(`  DB title:  ${s.title}`);
    console.log(`  Summary quotes: ${s.quotedTitles.map(t => `"${t}"`).join(' · ')}`);
    console.log();
  }

  console.log(`\nSummary: ${suspect.length} / ${books.length} books flagged.`);
  console.log(`Note: false positives are possible — summary may legitimately quote`);
  console.log(`other works for context. Manual review required before any fix.`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Audit failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
