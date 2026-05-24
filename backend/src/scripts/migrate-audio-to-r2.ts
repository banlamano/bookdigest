import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

const prisma = new PrismaClient();
const AUDIO_DIR = path.resolve(process.cwd(), '..', 'frontend', 'public', 'audio');
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

async function uploadOne(filename: string): Promise<string> {
  const filepath = path.join(AUDIO_DIR, filename);
  const body = await fs.promises.readFile(filepath);
  await s3.putObject({
    Bucket: process.env.R2_BUCKET!,
    Key: `audio/${filename}`,
    Body: body,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=31536000, immutable',
  }).promise();
  return `${R2_PUBLIC_URL}/audio/${filename}`;
}

async function main() {
  console.log('☁️  Migrating local MP3s → Cloudflare R2\n');

  // Find books that currently point to /audio/* (local files)
  const books = await prisma.book.findMany({
    where: { audioUrl: { startsWith: '/audio/' } },
    select: { id: true, title: true, audioUrl: true },
  });

  console.log(`📚 Found ${books.length} books with local audio\n`);

  let ok = 0;
  let fail = 0;

  for (const book of books) {
    const filename = book.audioUrl!.replace('/audio/', '');
    const filepath = path.join(AUDIO_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`  ⚠️  ${book.title} — file missing: ${filename}`);
      fail++;
      continue;
    }

    try {
      process.stdout.write(`  Uploading ${book.title.substring(0, 50).padEnd(50)} ... `);
      const newUrl = await uploadOne(filename);
      await prisma.book.update({
        where: { id: book.id },
        data: { audioUrl: newUrl },
      });
      console.log('✓');
      ok++;
    } catch (e: any) {
      console.log(`✗ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✨ ${ok} migrated, ${fail} failed`);
  console.log('\n📝 Next steps:');
  console.log('  1. Verify a few URLs in browser');
  console.log('  2. git rm -r frontend/public/audio/');
  console.log('  3. Commit and push');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
