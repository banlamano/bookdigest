import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Google Books API - Free, no API key required for basic usage
async function fetchBooksFromGoogleAPI(query: string, maxResults: number = 40) {
  const books = [];
  const startIndexes = [0, 40, 80, 120, 160]; // Fetch in batches
  
  for (const startIndex of startIndexes) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&orderBy=relevance&langRestrict=en&printType=books`
      );
      const data = await response.json();
      
      if (data.items) {
        books.push(...data.items);
      }
      
      // Rate limiting - be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching books at index ${startIndex}:`, error);
    }
  }
  
  return books;
}

async function main() {
  console.log('🌱 Seeding database with 500+ books from Google Books API...');

  // Create categories
  const categories = [
    { name: 'Business', slug: 'business', color: '#0ea5e9', icon: 'briefcase', order: 1 },
    { name: 'Self-Help', slug: 'self-help', color: '#8b5cf6', icon: 'heart', order: 2 },
    { name: 'Psychology', slug: 'psychology', color: '#ec4899', icon: 'brain', order: 3 },
    { name: 'Productivity', slug: 'productivity', color: '#10b981', icon: 'zap', order: 4 },
    { name: 'Leadership', slug: 'leadership', color: '#f59e0b', icon: 'users', order: 5 },
    { name: 'Finance', slug: 'finance', color: '#14b8a6', icon: 'dollar-sign', order: 6 },
    { name: 'Biography', slug: 'biography', color: '#f97316', icon: 'book', order: 7 },
    { name: 'Health', slug: 'health', color: '#22c55e', icon: 'heart-pulse', order: 8 },
    { name: 'Science', slug: 'science', color: '#6366f1', icon: 'atom', order: 9 },
    { name: 'History', slug: 'history', color: '#a855f7', icon: 'clock', order: 10 },
  ];

  console.log('Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // Fetch categories for assignment
  const categoryMap = {
    business: await prisma.category.findUnique({ where: { slug: 'business' } }),
    'self-help': await prisma.category.findUnique({ where: { slug: 'self-help' } }),
    productivity: await prisma.category.findUnique({ where: { slug: 'productivity' } }),
    psychology: await prisma.category.findUnique({ where: { slug: 'psychology' } }),
    leadership: await prisma.category.findUnique({ where: { slug: 'leadership' } }),
    finance: await prisma.category.findUnique({ where: { slug: 'finance' } }),
    biography: await prisma.category.findUnique({ where: { slug: 'biography' } }),
    health: await prisma.category.findUnique({ where: { slug: 'health' } }),
    science: await prisma.category.findUnique({ where: { slug: 'science' } }),
    history: await prisma.category.findUnique({ where: { slug: 'history' } }),
  };

  // Search queries for different categories
  const queries = [
    { query: 'business success leadership', category: 'business' },
    { query: 'self help personal development', category: 'self-help' },
    { query: 'productivity time management', category: 'productivity' },
    { query: 'psychology human behavior', category: 'psychology' },
    { query: 'leadership management', category: 'leadership' },
    { query: 'finance money investing', category: 'finance' },
    { query: 'biography autobiography memoir', category: 'biography' },
    { query: 'health wellness fitness', category: 'health' },
    { query: 'science technology innovation', category: 'science' },
    { query: 'history world war', category: 'history' },
  ];

  let totalBooks = 0;
  let createdBooks = 0;

  for (const { query, category } of queries) {
    console.log(`\n📚 Fetching ${category} books...`);
    const googleBooks = await fetchBooksFromGoogleAPI(query, 40);
    console.log(`   Found ${googleBooks.length} books`);

    for (const item of googleBooks) {
      try {
        const volumeInfo = item.volumeInfo;
        
        // Skip books without essential information
        if (!volumeInfo.title || !volumeInfo.authors || !volumeInfo.description) {
          continue;
        }

        // Get ISBN
        const isbn = volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
        )?.identifier || `GOOG-${item.id}`;

        // Get cover image (prefer high quality)
        const coverImage = volumeInfo.imageLinks?.large ||
                          volumeInfo.imageLinks?.medium ||
                          volumeInfo.imageLinks?.thumbnail ||
                          volumeInfo.imageLinks?.smallThumbnail ||
                          'https://via.placeholder.com/300x450/0ea5e9/ffffff?text=No+Cover';

        // Clean cover URL (remove zoom parameter for better quality)
        const cleanCoverUrl = coverImage.replace(/&zoom=\d+/, '').replace('http://', 'https://');

        // Generate summary (first 500 chars of description + ellipsis)
        const summary = volumeInfo.description.length > 500
          ? volumeInfo.description.substring(0, 500) + '...\n\nLearn more about the key insights and practical takeaways from this transformative book.'
          : volumeInfo.description + '\n\nDiscover the essential lessons and actionable strategies from this important work.';

        // Generate key insights
        const keyInsights = `• Understand the core principles and concepts presented
• Learn practical strategies you can apply immediately
• Gain insights from expert research and analysis
• Discover new perspectives on important topics
• Transform your thinking with actionable takeaways`;

        // Estimate reading time (rough: 200-250 words per minute, avg 60k words per book)
        const pageCount = volumeInfo.pageCount || 250;
        const readingTime = Math.round((pageCount * 250) / 200); // minutes

        // Random rating between 4.0 and 5.0
        const rating = +(4.0 + Math.random()).toFixed(1);

        // Generate tags from categories and title
        const tags = `${category},${volumeInfo.categories?.join(',') || 'general'},book summary,key insights`;

        // Check if book already exists
        const existingBook = await prisma.book.findUnique({
          where: { isbn }
        });

        if (existingBook) {
          continue; // Skip duplicates
        }

        await prisma.book.create({
          data: {
            title: volumeInfo.title,
            author: Array.isArray(volumeInfo.authors) 
              ? volumeInfo.authors.join(', ') 
              : volumeInfo.authors,
            isbn,
            summary,
            keyInsights,
            coverImage: cleanCoverUrl,
            publishedYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
            language: 'en',
            categoryId: categoryMap[category as keyof typeof categoryMap]?.id || categoryMap.business!.id,
            tags,
            chapters: 'Introduction,Main Concepts,Key Principles,Practical Applications,Conclusion',
            quotes: `"${volumeInfo.title} offers transformative insights for readers."`,
            actionItems: '• Apply the main concepts to your daily life\n• Reflect on key lessons learned\n• Share insights with others',
            audioUrl: null,
            audioDuration: readingTime,
            readingTime,
            rating,
            isPremium: Math.random() > 0.7 ? 1 : 0, // 30% premium
            isFeatured: Math.random() > 0.95 ? 1 : 0, // 5% featured
          },
        });

        createdBooks++;
        
        if (createdBooks % 10 === 0) {
          console.log(`   ✓ Created ${createdBooks} books...`);
        }

      } catch (error: any) {
        if (error.code === 'P2002') {
          // Duplicate, skip silently
          continue;
        }
        console.error(`   ⚠️  Error creating book: ${error.message}`);
      }
    }

    totalBooks += googleBooks.length;
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@bookdigest.com' },
    update: {},
    create: {
      email: 'demo@bookdigest.com',
      name: 'Demo User',
      password: hashedPassword,
      subscription: 'premium',
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      booksRead: 25,
      totalReadingTime: 15000,
      currentStreak: 12,
      longestStreak: 30,
    },
  });

  console.log('\n✅ Seeding completed!');
  console.log(`\n📊 Statistics:`);
  console.log(`   📚 Processed ${totalBooks} books from Google Books API`);
  console.log(`   ✓ Successfully created ${createdBooks} unique books`);
  console.log(`   🎯 Skipped ${totalBooks - createdBooks} (duplicates or incomplete data)`);
  console.log(`\n🚀 Restart the frontend to see all ${createdBooks} books!`);
  console.log(`\n💡 Tip: Run this script multiple times with different queries to add more books`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
