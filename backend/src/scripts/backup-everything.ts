import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

const prisma = new PrismaClient();

const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

function ts(): string {
  return new Date().toISOString().slice(0, 10);
}

const BACKUP_ROOT = path.resolve(process.cwd(), '..', '.backups', ts());

async function downloadAllR2(audioDir: string) {
  console.log('\n☁️  Downloading R2 audio files...');
  let continuationToken: string | undefined;
  let total = 0;
  do {
    const list = await s3.listObjectsV2({
      Bucket: process.env.R2_BUCKET!,
      ContinuationToken: continuationToken,
    }).promise();

    for (const obj of list.Contents || []) {
      if (!obj.Key) continue;
      const localPath = path.join(audioDir, path.basename(obj.Key));
      if (fs.existsSync(localPath) && fs.statSync(localPath).size === obj.Size) {
        total++;
        continue; // already downloaded with matching size
      }
      const data = await s3.getObject({ Bucket: process.env.R2_BUCKET!, Key: obj.Key }).promise();
      await fs.promises.writeFile(localPath, data.Body as Buffer);
      total++;
      if (total % 10 === 0) process.stdout.write(`  ${total} files... `);
    }
    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);
  console.log(`\n  ✅ ${total} audio files saved to ${audioDir}`);
  return total;
}

async function dumpTable<T>(name: string, fn: () => Promise<T[]>, dir: string) {
  const rows = await fn();
  const filepath = path.join(dir, `${name}.json`);
  await fs.promises.writeFile(filepath, JSON.stringify(rows, null, 2));
  const kb = Math.round(fs.statSync(filepath).size / 1024);
  console.log(`  ✅ ${name}.json (${rows.length} rows, ${kb} KB)`);
  return rows.length;
}

async function backupDb(dbDir: string) {
  console.log('\n💾 Exporting database tables to JSON...');
  await dumpTable('books', () => prisma.book.findMany(), dbDir);
  await dumpTable('categories', () => prisma.category.findMany(), dbDir);
  await dumpTable('users', () => prisma.user.findMany(), dbDir);
  await dumpTable('reviews', () => prisma.review.findMany(), dbDir);
  await dumpTable('favorites', () => prisma.favorite.findMany(), dbDir);
  await dumpTable('readingProgress', () => prisma.readingProgress.findMany(), dbDir);
  await dumpTable('readingHistory', () => prisma.readingHistory.findMany(), dbDir);
  await dumpTable('achievements', () => prisma.achievement.findMany(), dbDir);
  await dumpTable('userAchievements', () => prisma.userAchievement.findMany(), dbDir);
  await dumpTable('transactions', () => prisma.transaction.findMany(), dbDir);
}

async function copyEnv(secretsDir: string) {
  console.log('\n🔐 Copying environment files...');
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    await fs.promises.copyFile(envPath, path.join(secretsDir, 'backend.env'));
    console.log('  ✅ backend.env');
  }
  const frontEnv = path.resolve(process.cwd(), '..', 'frontend', '.env.production');
  if (fs.existsSync(frontEnv)) {
    await fs.promises.copyFile(frontEnv, path.join(secretsDir, 'frontend.env.production'));
    console.log('  ✅ frontend.env.production');
  }
}

async function writeReadme(rootDir: string, counts: { audio: number }) {
  const readme = `# Book Digest Backup — ${ts()}

## Contents

- \`audio/\` — ${counts.audio} MP3 files downloaded from Cloudflare R2 bucket \`${process.env.R2_BUCKET}\`
- \`db/\` — JSON dumps of every Postgres table (Supabase)
- \`secrets/\` — Copies of \`.env\` files (API keys, DB URL, JWT secret, Stripe keys, R2 creds, etc.)

## How to restore if R2 is lost

1. Recreate R2 bucket \`bookdigest-audio\` and make it public (see project docs)
2. Get new R2 credentials and update \`backend/.env\`
3. Upload all files from \`audio/\` back to R2:
   \`\`\`
   # From this backup folder, with new R2 creds loaded:
   aws s3 cp audio/ s3://bookdigest-audio/audio/ \\
     --endpoint-url https://<NEW_ACCOUNT_ID>.r2.cloudflarestorage.com \\
     --recursive --acl public-read
   \`\`\`
4. Update \`audioUrl\` in DB to point to new public URL prefix:
   \`\`\`sql
   UPDATE "Book"
   SET "audioUrl" = REPLACE("audioUrl",
     'https://pub-OLD.r2.dev',
     'https://pub-NEW.r2.dev');
   \`\`\`

## How to restore if database is lost

Supabase keeps its own daily backups. Use those first.
If unavailable, the JSON files in \`db/\` can be re-imported via Prisma seed
scripts or \`psql\` with the schema in \`backend/prisma/schema.prisma\`.

## ⚠️ Secrets

\`secrets/\` contains live API keys and database credentials.
- Do NOT commit this backup to git
- Move it to an encrypted external drive
- After restore, rotate every key as a precaution
`;
  await fs.promises.writeFile(path.join(rootDir, 'README.md'), readme);
  console.log('  ✅ README.md');
}

async function main() {
  console.log(`📦 Creating full backup at:\n   ${BACKUP_ROOT}\n`);

  const audioDir = path.join(BACKUP_ROOT, 'audio');
  const dbDir = path.join(BACKUP_ROOT, 'db');
  const secretsDir = path.join(BACKUP_ROOT, 'secrets');
  for (const d of [audioDir, dbDir, secretsDir]) {
    fs.mkdirSync(d, { recursive: true });
  }

  const audioCount = await downloadAllR2(audioDir);
  await backupDb(dbDir);
  await copyEnv(secretsDir);
  await writeReadme(BACKUP_ROOT, { audio: audioCount });

  // Size summary
  function dirSize(dir: string): number {
    let total = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      total += entry.isDirectory() ? dirSize(full) : fs.statSync(full).size;
    }
    return total;
  }
  const mb = (dirSize(BACKUP_ROOT) / 1024 / 1024).toFixed(1);

  console.log(`\n✨ Backup complete — ${mb} MB total`);
  console.log(`   ${BACKUP_ROOT}`);
  console.log('\n💡 Recommended: copy this folder to an external drive or cloud storage.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
