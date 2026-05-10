import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🎙️ BookDigest Audio Generation: English → German Library\n');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables.');
    console.log('To generate high-quality MP3 audio files, please add your OpenAI API Key.');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Get books missing MP3 audio (only those with summaries)
  const books = await prisma.book.findMany({
    where: {
      summary: { not: '' },
      OR: [
        { audioUrl: null },
        { audioUrl: 'browser-tts' }
      ]
    },
    take: 10, // Process in small batches to verify cost/quality
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📚 Found ${books.length} books to process for premium audio.\n`);

  for (const book of books) {
    try {
      const filename = `${book.id}.mp3`;
      const filepath = path.join(audioDir, filename);

      console.log(`Processing: "${book.title}" (${book.language})...`);
      
      // Use premium TTS models
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: book.language === 'de' ? 'shimmer' : 'alloy', // Shimmer sounds good for German
        input: book.summary.substring(0, 4096),
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(filepath, buffer);

      // Update book with the local URL and estimated duration
      const audioUrl = `/audio/${filename}`;
      // Estimate duration (approx 150 words per minute)
      const words = book.summary.split(/\s+/).length;
      const durationSeconds = Math.round((words / 150) * 60);

      await prisma.book.update({
        where: { id: book.id },
        data: { 
          audioUrl,
          audioDuration: durationSeconds
        }
      });

      console.log(`✅ Success! Audio file saved and linked: ${audioUrl}`);
      
      // Wait a bit to avoid massive billing spikes
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      console.error(`❌ Failed: "${book.title}" - ${e.message}`);
    }
  }

  console.log('\n✨ Audio generation batch completed!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
