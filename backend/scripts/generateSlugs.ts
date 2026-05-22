import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string, author: string): string {
  // Transliterate umlauts
  const transliterated = title.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
    
  const authorTransliterated = author.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
    
  const base = `${transliterated}-${authorTransliterated}`
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base;
}

async function main() {
  console.log('Generating slugs for books...');
  const books = await prisma.book.findMany();
  let count = 0;
  
  for (const book of books) {
    if (!book.slug) {
      let baseSlug = generateSlug(book.title, book.author);
      let slug = baseSlug;
      let suffix = 1;
      
      // Ensure uniqueness
      while (true) {
        const existing = await prisma.book.findUnique({ where: { slug } });
        if (!existing) {
          break;
        }
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }
      
      try {
        await prisma.book.update({
          where: { id: book.id },
          data: { slug }
        });
        count++;
        console.log(`[${count}] Updated: ${book.title} -> ${slug}`);
      } catch (e) {
        console.error(`Failed to update ${book.title}:`, e);
      }
    }
  }
  console.log(`\nSuccessfully generated slugs for ${count} books.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
