import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple book data - 50+ popular books
const booksData = [
  // Business (15 books)
  { title: 'Good to Great', author: 'Jim Collins', cat: 'business', premium: 1 },
  { title: 'The Lean Startup', author: 'Eric Ries', cat: 'business', premium: 0 },
  { title: 'Zero to One', author: 'Peter Thiel', cat: 'business', premium: 1 },
  { title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', cat: 'business', premium: 1 },
  { title: 'Built to Last', author: 'Jim Collins', cat: 'business', premium: 0 },
  { title: 'The E-Myth Revisited', author: 'Michael Gerber', cat: 'business', premium: 0 },
  { title: 'Crossing the Chasm', author: 'Geoffrey Moore', cat: 'business', premium: 1 },
  { title: 'The Innovator\'s Dilemma', author: 'Clayton Christensen', cat: 'business', premium: 1 },
  { title: 'Blue Ocean Strategy', author: 'W. Chan Kim', cat: 'business', premium: 1 },
  { title: 'The 4-Hour Workweek', author: 'Tim Ferriss', cat: 'business', premium: 0 },
  
  // Self-Help (15 books)
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', cat: 'self-help', premium: 0 },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', cat: 'self-help', premium: 0 },
  { title: 'Man\'s Search for Meaning', author: 'Viktor Frankl', cat: 'self-help', premium: 1 },
  { title: 'The Alchemist', author: 'Paulo Coelho', cat: 'self-help', premium: 0 },
  { title: 'Daring Greatly', author: 'Brené Brown', cat: 'self-help', premium: 1 },
  { title: 'You Are a Badass', author: 'Jen Sincero', cat: 'self-help', premium: 0 },
  { title: 'The Four Agreements', author: 'Don Miguel Ruiz', cat: 'self-help', premium: 0 },
  { title: 'Awaken the Giant Within', author: 'Tony Robbins', cat: 'self-help', premium: 1 },
  { title: 'The Magic of Thinking Big', author: 'David Schwartz', cat: 'self-help', premium: 0 },
  { title: 'Can\'t Hurt Me', author: 'David Goggins', cat: 'self-help', premium: 1 },
  
  // Productivity (10 books)
  { title: 'Essentialism', author: 'Greg McKeown', cat: 'productivity', premium: 0 },
  { title: 'The One Thing', author: 'Gary Keller', cat: 'productivity', premium: 0 },
  { title: 'Make Time', author: 'Jake Knapp', cat: 'productivity', premium: 0 },
  { title: 'Eat That Frog', author: 'Brian Tracy', cat: 'productivity', premium: 0 },
  { title: 'The Productivity Project', author: 'Chris Bailey', cat: 'productivity', premium: 0 },
  { title: 'Indistractable', author: 'Nir Eyal', cat: 'productivity', premium: 1 },
  { title: 'Digital Minimalism', author: 'Cal Newport', cat: 'productivity', premium: 1 },
  { title: 'The 5 AM Club', author: 'Robin Sharma', cat: 'productivity', premium: 0 },
  
  // Psychology (8 books)
  { title: 'Predictably Irrational', author: 'Dan Ariely', cat: 'psychology', premium: 1 },
  { title: 'The Power of Habit', author: 'Charles Duhigg', cat: 'psychology', premium: 0 },
  { title: 'Blink', author: 'Malcolm Gladwell', cat: 'psychology', premium: 0 },
  { title: 'Outliers', author: 'Malcolm Gladwell', cat: 'psychology', premium: 0 },
  { title: 'The Tipping Point', author: 'Malcolm Gladwell', cat: 'psychology', premium: 0 },
  { title: 'Emotional Intelligence', author: 'Daniel Goleman', cat: 'psychology', premium: 1 },
  
  // Leadership (8 books)
  { title: 'Extreme Ownership', author: 'Jocko Willink', cat: 'leadership', premium: 1 },
  { title: 'Dare to Lead', author: 'Brené Brown', cat: 'leadership', premium: 1 },
  { title: 'The 21 Irrefutable Laws of Leadership', author: 'John Maxwell', cat: 'leadership', premium: 0 },
  { title: 'Radical Candor', author: 'Kim Scott', cat: 'leadership', premium: 1 },
  { title: 'Turn the Ship Around', author: 'David Marquet', cat: 'leadership', premium: 0 },
  { title: 'The Five Dysfunctions of a Team', author: 'Patrick Lencioni', cat: 'leadership', premium: 0 },
  
  // Finance (8 books)
  { title: 'The Total Money Makeover', author: 'Dave Ramsey', cat: 'finance', premium: 0 },
  { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', cat: 'finance', premium: 0 },
  { title: 'The Richest Man in Babylon', author: 'George Clason', cat: 'finance', premium: 0 },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', cat: 'finance', premium: 0 },
  { title: 'Your Money or Your Life', author: 'Vicki Robin', cat: 'finance', premium: 1 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', cat: 'finance', premium: 1 },
  
  // Biography (5 books)
  { title: 'Steve Jobs', author: 'Walter Isaacson', cat: 'biography', premium: 1 },
  { title: 'Shoe Dog', author: 'Phil Knight', cat: 'biography', premium: 0 },
  { title: 'Elon Musk', author: 'Ashlee Vance', cat: 'biography', premium: 1 },
  { title: 'The Snowball: Warren Buffett', author: 'Alice Schroeder', cat: 'biography', premium: 1 },
  { title: 'Leonardo da Vinci', author: 'Walter Isaacson', cat: 'biography', premium: 1 },
  
  // Health (5 books)
  { title: 'Why We Sleep', author: 'Matthew Walker', cat: 'health', premium: 1 },
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', cat: 'health', premium: 1 },
  { title: 'Breath', author: 'James Nestor', cat: 'health', premium: 0 },
  { title: 'Atomic Habits', author: 'James Clear', cat: 'health', premium: 0 },
  { title: 'The 4-Hour Body', author: 'Tim Ferriss', cat: 'health', premium: 0 },
];

async function main() {
  console.log(`🌱 Adding ${booksData.length} books...`);

  const categories = await prisma.category.findMany();
  const catMap: any = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  const colors = ['0ea5e9', '8b5cf6', 'ec4899', '10b981', 'f59e0b', '14b8a6'];

  for (let i = 0; i < booksData.length; i++) {
    const book = booksData[i];
    const color = colors[i % colors.length];
    const isbn = `978${Math.floor(Math.random() * 10000000000)}`;
    
    await prisma.book.upsert({
      where: { isbn },
      update: {},
      create: {
        title: book.title,
        author: book.author,
        isbn,
        coverImage: `https://via.placeholder.com/300x450/${color}/ffffff?text=${encodeURIComponent(book.title.substring(0, 20))}`,
        summary: `${book.title} by ${book.author} provides valuable insights and practical wisdom. This comprehensive guide offers actionable strategies and proven principles for personal and professional growth. Learn the key concepts that have helped millions achieve success.`,
        keyInsights: JSON.stringify([
          `Master the core principles of ${book.title}`,
          'Apply proven strategies for success',
          'Implement actionable steps immediately',
          'Transform your approach to growth',
          'Achieve measurable results',
        ]),
        quotes: JSON.stringify([
          `"The wisdom in ${book.title} can transform your life." - Reader`,
          `"A must-read for anyone serious about growth." - Review`,
        ]),
        chapters: JSON.stringify([
          { title: 'Introduction', content: 'Overview of key concepts' },
          { title: 'Core Principles', content: 'Fundamental ideas' },
          { title: 'Practical Application', content: 'How to implement' },
        ]),
        actionItems: JSON.stringify([
          'Read and reflect on key insights',
          'Create an action plan',
          'Implement one strategy this week',
        ]),
        readingTime: 14 + Math.floor(Math.random() * 5),
        rating: 4.3 + Math.random() * 0.7,
        ratingsCount: 200 + Math.floor(Math.random() * 1000),
        isPremium: book.premium,
        isFeatured: i < 20 ? 1 : 0,
        isPublished: 1,
        categoryId: catMap[book.cat],
        tags: JSON.stringify([book.cat, 'bestseller', 'growth']),
        amazonLink: `https://www.amazon.com/dp/${isbn.substring(3, 13)}`,
        publishedYear: 2000 + Math.floor(Math.random() * 24),
      },
    });
    
    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${i + 1} books...`);
    }
  }

  console.log(`\n✅ Successfully added ${booksData.length} books!`);
  console.log('🎨 All with working placeholder covers');
  console.log('📚 Total books in database:', await prisma.book.count());
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
