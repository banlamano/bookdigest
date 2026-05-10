import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Enabling Browser TTS for all books...');

  const result = await prisma.book.updateMany({
    where: {
      OR: [
        { audioUrl: null },
        { audioUrl: '' }
      ]
    },
    data: {
      audioUrl: 'browser-tts'
    }
  });

  console.log(`✅ Success! Enabled audio for ${result.count} books.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
