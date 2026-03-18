import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const books = await prisma.book.findMany({
      take: 10,
      include: {
        category: true,
        _count: {
          select: { favorites: true, reviews: true }
        }
      }
    });
    console.log(`Success! Fetched ${books.length} books.`);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

main().finally(() => prisma.$disconnect());
