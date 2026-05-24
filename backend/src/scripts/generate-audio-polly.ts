import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as AWS from 'aws-sdk';

const prisma = new PrismaClient();
const BUCKET = process.env.AWS_S3_BUCKET!;
const REGION = process.env.AWS_REGION!;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: REGION,
});

const polly = new AWS.Polly();
const s3 = new AWS.S3();

// Split text at sentence boundaries, keeping each chunk under maxChars
function chunkText(text: string, maxChars = 2800): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? current + ' ' + sentence : sentence;
    if (candidate.length > maxChars) {
      if (current) chunks.push(current);
      // If a single sentence exceeds the limit, hard-split it
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

async function synthesizeChunk(text: string, voiceId: string, engine: 'neural' | 'standard'): Promise<Buffer> {
  const params: AWS.Polly.SynthesizeSpeechInput = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceId as AWS.Polly.VoiceId,
    Engine: engine,
  };
  const result = await polly.synthesizeSpeech(params).promise();
  if (!result.AudioStream) throw new Error('No AudioStream returned from Polly');
  return result.AudioStream as Buffer;
}

async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
  await s3.putObject({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg',
  }).promise();
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

async function generateAudio(book: { id: string; title: string; summary: string; language: string }): Promise<string> {
  const isDE = book.language === 'de';
  const voiceId = isDE ? 'Vicki' : 'Joanna';
  const chunks = chunkText(book.summary);

  console.log(`  Voice: ${voiceId} | Chunks: ${chunks.length}`);

  const buffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)... `);
    try {
      const buf = await synthesizeChunk(chunks[i], voiceId, 'neural');
      buffers.push(buf);
      console.log('✓');
    } catch (e: any) {
      // Neural not available in this region — fall back to standard
      if (e.code === 'ValidationException' && e.message?.includes('neural')) {
        console.log('neural unavailable, trying standard...');
        const stdVoice = isDE ? 'Marlene' : 'Joanna';
        const buf = await synthesizeChunk(chunks[i], stdVoice, 'standard');
        buffers.push(buf);
        console.log('✓ (standard)');
      } else {
        throw e;
      }
    }
    // Polly rate: 80 req/s — a small pause avoids throttling on long books
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 300));
  }

  const combined = Buffer.concat(buffers);
  const s3Key = `audio/${book.id}.mp3`;
  const url = await uploadToS3(combined, s3Key);

  const wordCount = book.summary.split(/\s+/).length;
  const durationSeconds = Math.round((wordCount / 130) * 60);

  await prisma.book.update({
    where: { id: book.id },
    data: { audioUrl: url, audioDuration: durationSeconds },
  });

  return url;
}

async function main() {
  console.log('🎙️  BookDigest Audio Generation — Amazon Polly → S3\n');

  if (!BUCKET || !REGION) {
    console.error('❌ AWS_S3_BUCKET or AWS_REGION missing from .env');
    process.exit(1);
  }

  // Top 10 by ReadingHistory count, then by ReadingProgress count
  const books = await prisma.book.findMany({
    where: {
      summary: { not: '' },
      OR: [{ audioUrl: null }, { audioUrl: 'browser-tts' }],
    },
    orderBy: [
      { readingHistory: { _count: 'desc' } },
      { progress: { _count: 'desc' } },
    ],
    take: 10,
    select: { id: true, title: true, summary: true, language: true },
  });

  if (books.length === 0) {
    console.log('✅ All books already have real audio.');
    return;
  }

  console.log(`📚 Processing ${books.length} book(s)\n`);
  let ok = 0;
  let fail = 0;

  for (const book of books) {
    console.log(`\n📖 "${book.title}" [${book.language}]`);
    try {
      const url = await generateAudio(book);
      console.log(`  ✅ ${url}`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✨ Done — ${ok} succeeded, ${fail} failed`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
