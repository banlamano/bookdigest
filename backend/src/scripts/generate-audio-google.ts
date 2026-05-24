import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Output to frontend/public/audio so Vercel's CDN serves the files
const AUDIO_DIR = path.resolve(process.cwd(), '..', 'frontend', 'public', 'audio');

// Google TTS limit is 5000 bytes per request — we use 4500 chars to be safe with UTF-8
const MAX_CHARS_PER_CHUNK = 4500;

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

async function generateAudio(book: { id: string; title: string; summary: string; language: string }): Promise<string> {
  const chunks = chunkText(book.summary);
  console.log(`  Voice: ${book.language === 'de' ? 'de-DE-Neural2-F' : 'en-US-Neural2-F'} | Chunks: ${chunks.length} | Total chars: ${book.summary.length}`);

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
  const filepath = path.join(AUDIO_DIR, filename);
  await fs.promises.writeFile(filepath, combined);

  const sizeKB = Math.round(combined.length / 1024);
  const wordCount = book.summary.split(/\s+/).length;
  const durationSeconds = Math.round((wordCount / 130) * 60);

  await prisma.book.update({
    where: { id: book.id },
    data: { audioUrl: `/audio/${filename}`, audioDuration: durationSeconds },
  });

  return `/audio/${filename} (${sizeKB} KB)`;
}

async function main() {
  console.log('🎙️  BookDigest Audio Generation — Google Cloud TTS\n');

  if (!GOOGLE_TTS_API_KEY) {
    console.error('❌ GOOGLE_TTS_API_KEY or GEMINI_API_KEY missing from .env');
    console.error('   Enable "Cloud Text-to-Speech API" in your GCP project and use the same key.');
    process.exit(1);
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`📁 Created ${AUDIO_DIR}`);
  }

  // Allow specifying a limit via CLI: npm run generate:audio -- 10
  const limit = parseInt(process.argv[2] || '10', 10);

  // Order by ReadingHistory count (most-read first), then ReadingProgress count
  const books = await prisma.book.findMany({
    where: {
      summary: { not: '' },
      OR: [{ audioUrl: null }, { audioUrl: 'browser-tts' }],
    },
    orderBy: [
      { readingHistory: { _count: 'desc' } },
      { progress: { _count: 'desc' } },
    ],
    take: limit,
    select: { id: true, title: true, summary: true, language: true },
  });

  if (books.length === 0) {
    console.log('✅ All books already have real audio.');
    return;
  }

  console.log(`📚 Processing ${books.length} book(s)\n`);
  let ok = 0;
  let fail = 0;
  let totalChars = 0;

  for (const book of books) {
    console.log(`\n📖 "${book.title}" [${book.language}]`);
    totalChars += book.summary.length;
    try {
      const result = await generateAudio(book);
      console.log(`  ✅ ${result}`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✨ Done — ${ok} succeeded, ${fail} failed`);
  console.log(`📊 Total characters synthesized: ${totalChars.toLocaleString()}`);
  console.log(`💰 Cost: ${totalChars <= 1_000_000 ? 'FREE (within 1M chars/month Neural2 tier)' : `~$${((totalChars / 1_000_000) * 16).toFixed(2)} for ${(totalChars / 1_000_000).toFixed(2)}M chars`}`);
  console.log(`\n💡 Files saved to: ${AUDIO_DIR}`);
  console.log('   Commit them with git and Vercel will serve from CDN.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
