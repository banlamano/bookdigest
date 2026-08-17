import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as AWS from 'aws-sdk';
import { google } from 'googleapis';
import { composeNarrationText, NarratableBook } from '../utils/narration';
import { loadCredentials } from './seo-report';

const prisma = new PrismaClient();
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const R2_BUCKET = process.env.R2_BUCKET;
const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

// Google TTS limit is 5000 bytes per request — we use 4500 chars to be safe with UTF-8
const MAX_CHARS_PER_CHUNK = 4500;

type Book = NarratableBook & { id: string };

/**
 * Pull Search Console impressions per /books/<slug> page over the last `days`.
 * Returns a slug→impressions map so the `demand=` batch can regenerate the
 * audio for books people are actually finding first. Returns null (not an
 * empty map) when GSC credentials or SC_SITE_URL are missing, so the caller
 * can fall back to the popularity ordering instead of silently prioritising
 * nothing. A book with no impressions simply never appears in the map.
 */
async function fetchImpressionsBySlug(days = 90): Promise<Map<string, number> | null> {
  const credentials = loadCredentials();
  const siteUrl = process.env.SC_SITE_URL;
  if (!credentials || !siteUrl) return null;

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as any,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth: (await auth.getClient()) as any });

  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: iso(start), endDate: iso(end), dimensions: ['page'], rowLimit: 1000 },
  });

  const map = new Map<string, number>();
  for (const row of res.data.rows ?? []) {
    const url = row.keys?.[0] ?? '';
    const m = url.match(/\/books\/([a-z0-9-]+)\/?$/i);
    if (m && (row.impressions ?? 0) > 0) {
      map.set(m[1], (map.get(m[1]) ?? 0) + (row.impressions ?? 0));
    }
  }
  return map;
}

function chunkText(text: string, maxChars = MAX_CHARS_PER_CHUNK): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? current + ' ' + sentence : sentence;
    if (candidate.length > maxChars) {
      if (current) chunks.push(current);
      if (sentence.length > maxChars) {
        for (let i = 0; i < sentence.length; i += maxChars) {
          chunks.push(sentence.slice(i, i + maxChars));
        }
        current = '';
      } else {
        current = sentence;
      }
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// One attempt at the TTS call. Throws a tagged error so the retry wrapper
// can tell a transient failure (network drop / 429 / 5xx) from a permanent
// one (4xx bad input — retrying that just wastes the char budget).
class RetryableError extends Error {}

async function synthesizeChunkOnce(text: string, language: string): Promise<Buffer> {
  const isDE = language === 'de';
  const body = {
    input: { text },
    voice: {
      languageCode: isDE ? 'de-DE' : 'en-US',
      name: isDE ? 'de-DE-Neural2-F' : 'en-US-Neural2-F',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${TTS_ENDPOINT}?key=${GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // Network-level failure ("fetch failed", ECONNRESET, ETIMEDOUT…) — transient.
    throw new RetryableError(err?.message || 'network error');
  }

  if (!res.ok) {
    const errText = await res.text();
    // 429 (rate limit) and 5xx (server) are worth retrying; 4xx is not.
    if (res.status === 429 || res.status >= 500) {
      throw new RetryableError(`Google TTS ${res.status}: ${errText}`);
    }
    throw new Error(`Google TTS ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { audioContent: string };
  return Buffer.from(data.audioContent, 'base64');
}

// Retry transient failures with exponential backoff (0.5s, 1s, 2s, 4s).
// Permanent errors bubble up immediately. Logs each retry inline so the
// run output shows what happened without failing the whole book.
async function synthesizeChunk(text: string, language: string, maxAttempts = 5): Promise<Buffer> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await synthesizeChunkOnce(text, language);
    } catch (err) {
      lastErr = err;
      if (!(err instanceof RetryableError) || attempt === maxAttempts) throw err;
      const backoffMs = 500 * 2 ** (attempt - 1);
      process.stdout.write(`↻retry ${attempt}/${maxAttempts - 1} in ${backoffMs}ms... `);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  throw lastErr; // unreachable, but satisfies the type checker
}

async function generateAudio(book: Book): Promise<{ url: string; chars: number; sizeKB: number }> {
  const narrationText = composeNarrationText(book);
  const chunks = chunkText(narrationText);
  console.log(`  Voice: ${book.language === 'de' ? 'de-DE-Neural2-F' : 'en-US-Neural2-F'} | Chunks: ${chunks.length} | Total chars: ${narrationText.length} (summary alone: ${book.summary.length})`);

  const buffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)... `);
    const buf = await synthesizeChunk(chunks[i], book.language);
    buffers.push(buf);
    console.log('✓');
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 200));
  }

  const combined = Buffer.concat(buffers);
  const filename = `${book.id}.mp3`;

  await s3.putObject({
    Bucket: R2_BUCKET!,
    Key: `audio/${filename}`,
    Body: combined,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=31536000, immutable',
  }).promise();

  const audioUrl = `${R2_PUBLIC_URL}/audio/${filename}`;
  const sizeKB = Math.round(combined.length / 1024);
  const wordCount = narrationText.split(/\s+/).length;
  const durationSeconds = Math.round((wordCount / 130) * 60);

  await prisma.book.update({
    where: { id: book.id },
    data: { audioUrl, audioDuration: durationSeconds, audioRegeneratedAt: new Date() },
  });

  return { url: audioUrl, chars: narrationText.length, sizeKB };
}

async function main() {
  console.log('🎙️  BookDigest Audio Generation — Google Cloud TTS\n');

  if (!GOOGLE_TTS_API_KEY) {
    console.error('❌ GOOGLE_TTS_API_KEY or GEMINI_API_KEY missing from .env');
    process.exit(1);
  }

  if (!R2_PUBLIC_URL || !R2_BUCKET || !process.env.R2_ACCESS_KEY_ID) {
    console.error('❌ R2_* env vars missing. See .env.example');
    process.exit(1);
  }

  // CLI:
  //   npm run generate:audio -- 10                 → top 10 by reading count (no audio yet)
  //   npm run generate:audio -- ids=<uuid>,...     → specific books only
  //   npm run generate:audio -- regen              → regenerate ALL books that have audio
  //   npm run generate:audio -- regen=50           → regenerate first 50 that have audio
  //   npm run generate:audio -- next=30            → next 30 most-read books that still
  //                                                  have summary-only audio (the monthly
  //                                                  "calendar" mode that walks the catalog)
  //   npm run generate:audio -- next               → all books with summary-only audio
  //   npm run generate:audio -- demand=30          → same pool as next=, but ordered by
  //                                                  Search Console impressions (real demand)
  //                                                  first, then popularity for the tail.
  //                                                  Needs GOOGLE_SA_KEY_* + SC_SITE_URL.
  const argv = process.argv[2] || '10';
  const fullSelect = {
    id: true, title: true, summary: true, language: true,
    keyInsights: true, chapters: true, quotes: true, actionItems: true,
  } as const;
  let books: Book[];

  if (argv.startsWith('ids=')) {
    const ids = argv.slice(4).split(',').map(s => s.trim()).filter(Boolean);
    books = await prisma.book.findMany({
      where: { id: { in: ids }, summary: { not: '' } },
      select: fullSelect,
    }) as unknown as Book[];
  } else if (argv === 'demand' || argv.startsWith('demand=')) {
    // Demand-first catalog walker: same candidate pool as `next=` (books
    // still on summary-only audio), but ordered by real Search Console
    // impressions so the pages people are actually finding get full audio
    // first. Books with no impressions yet fall back to popularity
    // (ratingsCount, then rating), so a batch is always full even early on
    // when only a handful of books have any impressions. If GSC creds are
    // missing it degrades to the pure popularity order with a warning.
    const limit = argv === 'demand' ? undefined : parseInt(argv.slice(7), 10);

    const candidates = await prisma.book.findMany({
      where: {
        summary: { not: '' },
        audioUrl: { contains: '.r2.dev/audio/' },
        audioRegeneratedAt: null,
      },
      // Popularity is the fallback order; the impressions overlay re-ranks on top.
      orderBy: [{ ratingsCount: 'desc' }, { rating: 'desc' }],
      select: { id: true, slug: true },
    });

    const impressions = await fetchImpressionsBySlug(90);
    if (!impressions) {
      console.warn('⚠️  No Search Console credentials (GOOGLE_SA_KEY_* + SC_SITE_URL) — falling back to popularity order.');
    }

    // Stable sort: impressions desc first, popularity order (the array's
    // existing order) breaks ties and orders the zero-impression tail.
    const ranked = candidates
      .map((b, i) => ({ b, i, imp: impressions?.get(b.slug ?? '') ?? 0 }))
      .sort((a, z) => (z.imp - a.imp) || (a.i - z.i));

    const chosen = (limit ? ranked.slice(0, limit) : ranked);
    const withImp = chosen.filter((r) => r.imp > 0).length;
    console.log(`🎯  Demand order: ${withImp}/${chosen.length} chosen books have Search Console impressions; the rest fill by popularity.`);

    const orderedIds = chosen.map((r) => r.b.id);
    const fetched = await prisma.book.findMany({
      where: { id: { in: orderedIds } },
      select: fullSelect,
    }) as unknown as Book[];
    // findMany ignores `in` order — restore the demand ranking.
    const byId = new Map(fetched.map((b) => [b.id, b]));
    books = orderedIds.map((id) => byId.get(id)!).filter(Boolean);
  } else if (argv === 'next' || argv.startsWith('next=')) {
    // Monthly catalog walker: pick the highest-traffic books that still
    // have the old summary-only audio (audioRegeneratedAt IS NULL).
    // Idempotent across months — each run picks up where the previous
    // one left off. Designed to stay within Google's 1M chars/month
    // free tier when limited to ~30-35 books.
    const limit = argv === 'next' ? undefined : parseInt(argv.slice(5), 10);
    books = await prisma.book.findMany({
      where: {
        summary: { not: '' },
        audioUrl: { contains: '.r2.dev/audio/' },
        audioRegeneratedAt: null,
      },
      orderBy: [
        { readingHistory: { _count: 'desc' } },
        { progress: { _count: 'desc' } },
      ],
      ...(limit ? { take: limit } : {}),
      select: fullSelect,
    }) as unknown as Book[];
  } else if (argv === 'regen' || argv.startsWith('regen=')) {
    // Refresh existing audio so the narration covers all content sections,
    // not just the summary. Pick books that ALREADY have an R2 mp3 url.
    const limit = argv === 'regen' ? undefined : parseInt(argv.slice(6), 10);
    books = await prisma.book.findMany({
      where: {
        summary: { not: '' },
        audioUrl: { contains: '.r2.dev/audio/' },
      },
      orderBy: [
        { readingHistory: { _count: 'desc' } },
        { progress: { _count: 'desc' } },
      ],
      ...(limit ? { take: limit } : {}),
      select: fullSelect,
    }) as unknown as Book[];
  } else {
    const limit = parseInt(argv, 10);
    books = await prisma.book.findMany({
      where: {
        summary: { not: '' },
        OR: [{ audioUrl: null }, { audioUrl: 'browser-tts' }],
      },
      orderBy: [
        { readingHistory: { _count: 'desc' } },
        { progress: { _count: 'desc' } },
      ],
      take: limit,
      select: fullSelect,
    }) as unknown as Book[];
  }

  if (books.length === 0) {
    console.log('✅ All books already have real audio.');
    return;
  }

  // Dry-run mode: list what would be processed without spending the API
  // budget. Append `--dry` after the mode (e.g. `next=30 --dry`).
  if (process.argv.includes('--dry')) {
    let projectedChars = 0;
    console.log(`📋 DRY RUN — would process ${books.length} book(s):\n`);
    for (const b of books) {
      const chars = composeNarrationText(b).length;
      projectedChars += chars;
      console.log(`  ${b.id.slice(0, 8)} [${b.language}] ${chars.toString().padStart(6)} chars — ${b.title}`);
    }
    console.log(`\nProjected total: ${projectedChars.toLocaleString()} chars`);
    const free = Math.min(projectedChars, 1_000_000);
    const paid = Math.max(0, projectedChars - 1_000_000);
    console.log(`  Within free tier: ${free.toLocaleString()} chars`);
    if (paid > 0) {
      console.log(`  Beyond free tier: ${paid.toLocaleString()} chars (~$${((paid / 1_000_000) * 16).toFixed(2)})`);
    } else {
      console.log(`  💰 FREE — within Google's 1M chars/month Neural2 tier`);
    }
    return;
  }

  console.log(`📚 Processing ${books.length} book(s)\n`);
  let ok = 0;
  let fail = 0;
  let totalChars = 0;

  for (const book of books) {
    console.log(`\n📖 "${book.title}" [${book.language}]`);
    try {
      const result = await generateAudio(book);
      totalChars += result.chars;
      console.log(`  ✅ ${result.url} (${result.sizeKB} KB)`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✨ Done — ${ok} succeeded, ${fail} failed`);
  console.log(`📊 Total characters synthesized: ${totalChars.toLocaleString()}`);
  console.log(`💰 Cost: ${totalChars <= 1_000_000 ? 'FREE (within 1M chars/month Neural2 tier)' : `~$${((totalChars / 1_000_000) * 16).toFixed(2)} for ${(totalChars / 1_000_000).toFixed(2)}M chars`}`);
  console.log(`\n☁️  Files uploaded to R2 bucket: ${R2_BUCKET}`);
  console.log(`   Served via: ${R2_PUBLIC_URL}/audio/<book-id>.mp3`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
