/**
 * Weekly SEO health report — Google Search Console + GA4 in one pass.
 *
 *   npm run seo:weekly                 → last 7 days vs the prior 7 days
 *   npm run seo:weekly -- 28           → last 28 days vs the prior 28 days
 *
 * Auth: a Google service account with read access to BOTH
 *   - Search Console (add the SA email as a "Full"/"Restricted" user in
 *     Search Console → Settings → Users and permissions)
 *   - GA4 (add the SA email as a Viewer in GA4 → Admin → Property Access)
 *
 * Provide the key one of two ways (inline wins, handy on Render):
 *   GOOGLE_SA_KEY_JSON   = '{"type":"service_account",...}'   (the whole JSON)
 *   GOOGLE_SA_KEY_PATH   = ./secrets/sa.json                  (path to the file)
 *
 * Plus the two targets:
 *   SC_SITE_URL    = https://book-digest.com/     (exactly as it appears in SC)
 *   GA4_PROPERTY_ID = 123456789                    (numeric, no "properties/")
 *
 * The report degrades gracefully: if only one of the two is configured it
 * prints that half and tells you what's missing for the other.
 *
 * The CLI prints the report; the weekly cron job (seo-report.job.ts) reuses
 * `generateSeoReport()` to email the same text. Keep formatting plain-text so
 * it reads fine in both a terminal and an email <pre> block.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { google } from 'googleapis';

// ---- small formatting helpers -------------------------------------------------
const nf = new Intl.NumberFormat('en-US');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));

/** "+12.3%" / "−4.0%" / "n/a" — the directional delta between two periods. */
function delta(curr: number, prev: number): string {
  if (prev === 0) return curr === 0 ? '   —  ' : '  new ';
  const d = (curr - prev) / prev;
  const arrow = d > 0 ? '▲' : d < 0 ? '▼' : ' ';
  const sign = d > 0 ? '+' : '';
  return `${arrow}${sign}${(d * 100).toFixed(1)}%`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---- auth ---------------------------------------------------------------------
export function loadCredentials(): Record<string, unknown> | null {
  const inline = process.env.GOOGLE_SA_KEY_JSON;
  if (inline && inline.trim().startsWith('{')) {
    try {
      return JSON.parse(inline);
    } catch {
      console.error('⚠️  GOOGLE_SA_KEY_JSON is set but is not valid JSON — ignoring.');
    }
  }
  const keyPath = process.env.GOOGLE_SA_KEY_PATH;
  if (keyPath) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(path.resolve(process.cwd(), keyPath));
    } catch {
      console.error(`⚠️  GOOGLE_SA_KEY_PATH points to "${keyPath}" but it could not be read.`);
    }
  }
  return null;
}

const SETUP_HELP = `
🔑  No Google service-account credentials found, so this report can't run yet.
    One-time setup (≈5 min):

    1. Google Cloud Console → IAM & Admin → Service Accounts → Create.
       Skip role grants; just create it and make a JSON key.
    2. Enable the APIs for that project:
         • "Google Search Console API"
         • "Google Analytics Data API"
    3. Grant the service-account EMAIL read access:
         • Search Console → Settings → Users and permissions → add as "Full".
         • GA4 → Admin → Property access management → add as "Viewer".
    4. Put the key + targets in backend/.env:
         GOOGLE_SA_KEY_JSON='<paste the entire JSON on one line>'
         SC_SITE_URL=https://book-digest.com/
         GA4_PROPERTY_ID=<your numeric GA4 property id>

    Then: npm run seo:weekly
`;

// ---- Search Console -----------------------------------------------------------
async function searchConsoleSection(auth: any, siteUrl: string, days: number, out: string[]) {
  const sc = google.searchconsole({ version: 'v1', auth });

  const curStart = isoDaysAgo(days);
  const curEnd = isoDaysAgo(1);
  const prevStart = isoDaysAgo(days * 2);
  const prevEnd = isoDaysAgo(days + 1);

  async function totals(startDate: string, endDate: string) {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate, dimensions: [] },
    });
    const row = res.data.rows?.[0];
    return {
      clicks: row?.clicks ?? 0,
      impressions: row?.impressions ?? 0,
      ctr: row?.ctr ?? 0,
      position: row?.position ?? 0,
    };
  }

  async function byDimension(dim: string, rowLimit = 10, startDate = curStart, endDate = curEnd) {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate, dimensions: [dim], rowLimit },
    });
    return res.data.rows ?? [];
  }

  const [cur, prev, queries, pages, countries] = await Promise.all([
    totals(curStart, curEnd),
    totals(prevStart, prevEnd),
    byDimension('query', 10),
    byDimension('page', 10),
    byDimension('country', 15),
  ]);

  out.push(`\n🔍  SEARCH CONSOLE  —  ${siteUrl}`);
  out.push(`    Window: ${curStart} → ${curEnd}  (vs prior ${days} days)\n`);
  out.push(`    Clicks       ${pad(nf.format(Math.round(cur.clicks)), 9)} ${delta(cur.clicks, prev.clicks)}`);
  out.push(`    Impressions  ${pad(nf.format(Math.round(cur.impressions)), 9)} ${delta(cur.impressions, prev.impressions)}`);
  out.push(`    CTR          ${pad(pct(cur.ctr), 9)} ${delta(cur.ctr, prev.ctr)}`);
  out.push(`    Avg position ${pad(cur.position.toFixed(1), 9)} ${delta(prev.position, cur.position)} (lower is better)`);

  // DE vs US split — the whole point of the sitemap fix was unlocking the
  // German catalog, so call those two out explicitly.
  const de = countries.find((r) => r.keys?.[0] === 'deu');
  const us = countries.find((r) => r.keys?.[0] === 'usa');
  out.push(`\n    By country (impressions):`);
  out.push(`      🇩🇪 Germany  ${pad(nf.format(Math.round(de?.impressions ?? 0)), 9)}  (${nf.format(Math.round(de?.clicks ?? 0))} clicks)`);
  out.push(`      🇺🇸 USA      ${pad(nf.format(Math.round(us?.impressions ?? 0)), 9)}  (${nf.format(Math.round(us?.clicks ?? 0))} clicks)`);

  out.push(`\n    Top queries:`);
  for (const r of queries.slice(0, 10)) {
    out.push(`      ${pad(r.keys?.[0] ?? '', 38)} ${pad(nf.format(Math.round(r.impressions ?? 0)) + ' imp', 12)} ${nf.format(Math.round(r.clicks ?? 0))} clk`);
  }

  out.push(`\n    Top pages:`);
  for (const r of pages.slice(0, 10)) {
    const url = (r.keys?.[0] ?? '').replace('https://book-digest.com', '');
    out.push(`      ${pad(url, 44)} ${pad(nf.format(Math.round(r.impressions ?? 0)) + ' imp', 12)} ${nf.format(Math.round(r.clicks ?? 0))} clk`);
  }
}

// ---- GA4 ----------------------------------------------------------------------
async function ga4Section(auth: any, propertyId: string, days: number, out: string[]) {
  const data = google.analyticsdata({ version: 'v1beta', auth });
  const property = `properties/${propertyId}`;

  const run = (body: any) =>
    data.properties.runReport({ property, requestBody: body });

  const [overview, byCountry, topPages, bySource] = await Promise.all([
    run({
      dateRanges: [
        { startDate: `${days}daysAgo`, endDate: 'yesterday' },
        { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    }),
    run({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: '8',
    }),
    run({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '10',
    }),
    run({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '8',
    }),
  ]);

  const cur = overview.data.rows?.[0]?.metricValues?.map((m) => Number(m.value)) ?? [0, 0, 0, 0];
  const prev = overview.data.rows?.[1]?.metricValues?.map((m) => Number(m.value)) ?? [0, 0, 0, 0];

  out.push(`\n📈  GA4  —  property ${propertyId}`);
  out.push(`    Window: last ${days} days (vs prior ${days})\n`);
  out.push(`    Active users  ${pad(nf.format(cur[0]), 9)} ${delta(cur[0], prev[0])}`);
  out.push(`    Sessions      ${pad(nf.format(cur[1]), 9)} ${delta(cur[1], prev[1])}`);
  out.push(`    Page views    ${pad(nf.format(cur[2]), 9)} ${delta(cur[2], prev[2])}`);
  out.push(`    Avg session   ${pad(`${Math.round(cur[3])}s`, 9)} ${delta(cur[3], prev[3])}`);

  out.push(`\n    Users by country:`);
  for (const r of byCountry.data.rows ?? []) {
    out.push(`      ${pad(r.dimensionValues?.[0]?.value ?? '', 24)} ${nf.format(Number(r.metricValues?.[0]?.value ?? 0))}`);
  }

  out.push(`\n    Sessions by channel:`);
  for (const r of bySource.data.rows ?? []) {
    out.push(`      ${pad(r.dimensionValues?.[0]?.value ?? '', 24)} ${nf.format(Number(r.metricValues?.[0]?.value ?? 0))}`);
  }

  out.push(`\n    Top pages (views):`);
  for (const r of topPages.data.rows ?? []) {
    out.push(`      ${pad(r.dimensionValues?.[0]?.value ?? '', 44)} ${nf.format(Number(r.metricValues?.[0]?.value ?? 0))}`);
  }
}

/**
 * Build the full report as plain text. Returns { ok, text }: ok is false only
 * when credentials are missing entirely (text then holds the setup help).
 * Individual section failures are caught and noted inline so one broken API
 * never blanks the whole report.
 */
export async function generateSeoReport(days = 7): Promise<{ ok: boolean; text: string }> {
  const credentials = loadCredentials();
  if (!credentials) {
    return { ok: false, text: SETUP_HELP };
  }

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as any,
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
  });
  const client = await auth.getClient();

  const out: string[] = [];
  out.push('═'.repeat(72));
  out.push(`  📊  WEEKLY SEO REPORT  —  ${new Date().toISOString().slice(0, 10)}  (last ${days} days)`);
  out.push('═'.repeat(72));

  const siteUrl = process.env.SC_SITE_URL;
  const ga4 = process.env.GA4_PROPERTY_ID;

  if (siteUrl) {
    try {
      await searchConsoleSection(client as any, siteUrl, days, out);
    } catch (err: any) {
      out.push(`\n🔍  Search Console section failed: ${err?.message ?? err}`);
      out.push('    (Is the service-account email added as a user on the property?)');
    }
  } else {
    out.push('\n🔍  SEARCH CONSOLE skipped — set SC_SITE_URL to enable.');
  }

  if (ga4) {
    try {
      await ga4Section(client as any, ga4, days, out);
    } catch (err: any) {
      out.push(`\n📈  GA4 section failed: ${err?.message ?? err}`);
      out.push('    (Is the service-account email a Viewer on the GA4 property?)');
    }
  } else {
    out.push('\n📈  GA4 skipped — set GA4_PROPERTY_ID to enable.');
  }

  out.push('\n' + '═'.repeat(72));
  return { ok: true, text: out.join('\n') };
}

// ---- CLI ----------------------------------------------------------------------
async function main() {
  const days = parseInt(process.argv[2] ?? '7', 10) || 7;
  const { ok, text } = await generateSeoReport(days);
  console.log(text);
  if (!ok) process.exit(1);
}

// Only run as a CLI when invoked directly, not when imported by the cron job.
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
