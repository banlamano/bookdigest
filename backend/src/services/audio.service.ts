import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';

export class AudioService {
  private openai: OpenAI | null = null;
  private audioDir: string;

  constructor() {
    this.audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateAudioForBook(bookId: string): Promise<string | null> {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, summary: true, language: true }
    });

    if (!book || !book.summary) {
      console.error(`Book ${bookId} not found or missing summary`);
      return null;
    }

    if (!this.openai) {
      console.warn('⚠️ OpenAI API Key not found. Cannot generate premium audio.');
      return 'browser-tts'; // Fallback
    }

    const filename = `${bookId}.mp3`;
    const filepath = path.join(this.audioDir, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      return `/audio/${filename}`;
    }

    try {
      console.log(`🎙️ Generating audio for "${book.title}"...`);
      
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Can be customized (alloy, echo, fable, onyx, nova, shimmer)
        input: book.summary.substring(0, 4000), // OpenAI limit is 4096 chars per request
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(filepath, buffer);

      // Update book with the local URL
      const audioUrl = `/audio/${filename}`;
      await prisma.book.update({
        where: { id: bookId },
        data: { audioUrl }
      });

      console.log(`✅ Audio generated: ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      console.error('TTS Generation failed:', error);
      return null;
    }
  }
}

export const audioService = new AudioService();
