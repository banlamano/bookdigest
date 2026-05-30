import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as AWS from 'aws-sdk';
import { composeNarrationText, NarratableBook } from '../utils/narration';

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

async function synthesizeChunk(text: string, language: string): Promise<Buffer> {
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

  const res = await fetch(`${TTS_ENDPOINT}?key=${GOOGLE_TTS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google TTS ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { audioContent: string };
  return Buffer.from(data.audioContent, 'base64');
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
