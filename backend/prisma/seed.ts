import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = [
    { name: 'Business', slug: 'business', color: '#0ea5e9', icon: 'briefcase', order: 1 },
    { name: 'Self-Help', slug: 'self-help', color: '#8b5cf6', icon: 'heart', order: 2 },
    { name: 'Psychology', slug: 'psychology', color: '#ec4899', icon: 'brain', order: 3 },
    { name: 'Productivity', slug: 'productivity', color: '#10b981', icon: 'zap', order: 4 },
    { name: 'Leadership', slug: 'leadership', color: '#f59e0b', icon: 'users', order: 5 },
    { name: 'Finance', slug: 'finance', color: '#14b8a6', icon: 'dollar-sign', order: 6 },
  ];

  console.log('Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Get business category
  const businessCat = await prisma.category.findUnique({ where: { slug: 'business' } });
  const selfHelpCat = await prisma.category.findUnique({ where: { slug: 'self-help' } });
  const productivityCat = await prisma.category.findUnique({ where: { slug: 'productivity' } });

  // Create sample books
  const books = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '9780735211292',
      summary: `Atomic Habits is a comprehensive guide to breaking bad habits and adopting good ones. James Clear presents a proven framework for improving every day. The book shows how tiny changes can lead to remarkable results through the compounding effects of small habits.

Key concepts include the four laws of behavior change, habit stacking, and the importance of systems over goals. Clear emphasizes that success is the product of daily habits, not once-in-a-lifetime transformations.`,
      keyInsights: JSON.stringify([
        '1% better every day leads to 37x improvement in a year through compound effects',
        'Make it obvious: Design your environment to make good habits easier and bad habits harder',
        'Make it attractive: Bundle habits you need to do with habits you want to do',
        'Make it easy: Reduce friction for good habits and increase it for bad ones',
        'Make it satisfying: Use reinforcement and tracking to lock in habits',
        'Focus on systems, not goals - winners and losers have the same goals',
        'Your habits shape your identity, and your identity shapes your habits',
      ]),
      quotes: JSON.stringify([
        'You do not rise to the level of your goals. You fall to the level of your systems.',
        'Every action you take is a vote for the type of person you wish to become.',
        'Habits are the compound interest of self-improvement.',
        'You should be far more concerned with your current trajectory than with your current results.',
      ]),
      chapters: JSON.stringify([
        { title: 'The Fundamentals', content: 'Why tiny changes make a big difference' },
        { title: 'The 1st Law: Make It Obvious', content: 'How to build better habits' },
        { title: 'The 2nd Law: Make It Attractive', content: 'How to make habits irresistible' },
        { title: 'The 3rd Law: Make It Easy', content: 'How to master difficult habits' },
        { title: 'The 4th Law: Make It Satisfying', content: 'How to stick with good habits' },
      ]),
      actionItems: JSON.stringify([
        'Start with a habit that takes less than 2 minutes',
        'Use habit stacking: After [CURRENT HABIT], I will [NEW HABIT]',
        'Track your habits daily to make progress visible',
        'Design your environment to make good habits obvious',
        'Join a culture where your desired behavior is normal',
      ]),
      readingTime: 15,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
      rating: 4.8,
      ratingsCount: 1250,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: productivityCat!.id,
      tags: JSON.stringify(['productivity', 'self-improvement', 'habits', 'behavior-change']),
      amazonLink: 'https://www.amazon.com/dp/0735211292',
      publishedYear: 2018,
    },
    {
      title: 'Think and Grow Rich',
      author: 'Napoleon Hill',
      isbn: '9781585424337',
      summary: `Think and Grow Rich is one of the best-selling books of all time. Napoleon Hill interviewed over 500 successful people including Andrew Carnegie, Thomas Edison, and Henry Ford to discover the secrets of success.

The book presents 13 principles for achieving success and wealth, emphasizing the power of thought, desire, faith, and persistence. It's not just about money - it's about achieving success in all areas of life.`,
      keyInsights: JSON.stringify([
        'Thoughts are things - what you think about consistently becomes your reality',
        'Desire is the starting point of all achievement',
        'Faith and visualization make success inevitable',
        'Specialized knowledge is more valuable than general education',
        'A mastermind group accelerates success exponentially',
        'Persistence is essential - most people quit right before they would have succeeded',
        'The subconscious mind is the link between thought and reality',
      ]),
      quotes: JSON.stringify([
        'Whatever the mind can conceive and believe, it can achieve.',
        'Strength and growth come only through continuous effort and struggle.',
        'The starting point of all achievement is desire.',
        'You are the master of your destiny.',
      ]),
      chapters: JSON.stringify([
        { title: 'Desire', content: 'The starting point of all achievement' },
        { title: 'Faith', content: 'Visualization and belief in attainment' },
        { title: 'Autosuggestion', content: 'The medium for influencing the subconscious' },
        { title: 'Specialized Knowledge', content: 'Personal experiences or observations' },
        { title: 'Imagination', content: 'The workshop of the mind' },
      ]),
      actionItems: JSON.stringify([
        'Write down your definite chief aim - what do you want most?',
        'Create a visualization practice - see yourself achieving your goals',
        'Form or join a mastermind group of like-minded achievers',
        'Develop specialized knowledge in your chosen field',
        'Read your goals aloud twice daily with faith and emotion',
      ]),
      readingTime: 15,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
      rating: 4.7,
      ratingsCount: 890,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: selfHelpCat!.id,
      tags: JSON.stringify(['success', 'wealth', 'mindset', 'classic']),
      amazonLink: 'https://www.amazon.com/dp/1585424331',
      publishedYear: 1937,
    },
    {
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen R. Covey',
      isbn: '9780743269513',
      summary: `Stephen Covey presents a principle-centered approach for solving personal and professional problems. The book teaches seven habits that lead to effectiveness and success.

These habits move from dependence to independence to interdependence, creating a framework for personal and organizational effectiveness.`,
      keyInsights: JSON.stringify([
        'Be Proactive - Take responsibility for your life',
        'Begin with the End in Mind - Define your mission and goals',
        'Put First Things First - Prioritize important over urgent',
        'Think Win-Win - Seek mutual benefit in all interactions',
        'Seek First to Understand, Then to Be Understood - Practice empathetic listening',
        'Synergize - Combine strengths through teamwork',
        'Sharpen the Saw - Maintain and renew your resources',
      ]),
      quotes: JSON.stringify([
        'Most people do not listen with the intent to understand; they listen with the intent to reply.',
        'To change ourselves effectively, we first had to change our perceptions.',
        'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.',
        'Sow a thought, reap an action; sow an action, reap a habit.',
      ]),
      chapters: JSON.stringify([
        { title: 'Paradigms and Principles', content: 'Inside-out approach' },
        { title: 'Private Victory', content: 'Habits 1-3: Independence' },
        { title: 'Public Victory', content: 'Habits 4-6: Interdependence' },
        { title: 'Renewal', content: 'Habit 7: Continuous improvement' },
      ]),
      actionItems: JSON.stringify([
        'Write your personal mission statement',
        'Use the Eisenhower Matrix to prioritize tasks (urgent/important)',
        'Practice empathetic listening for one week',
        'Identify one area where you can think win-win instead of win-lose',
        'Schedule weekly time for renewal in all four dimensions',
      ]),
      readingTime: 16,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780743269513-L.jpg',
      rating: 4.9,
      ratingsCount: 2100,
      isPremium: 1,
      isFeatured: 1,
      isPublished: 1,
      categoryId: selfHelpCat!.id,
      tags: JSON.stringify(['effectiveness', 'habits', 'personal-development', 'classic']),
      amazonLink: 'https://www.amazon.com/dp/0743269519',
      publishedYear: 1989,
    },
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert T. Kiyosaki',
      isbn: '9781612680194',
      summary: `Rich Dad Poor Dad challenges conventional wisdom about money and investing. Robert Kiyosaki shares lessons from his two "dads" - his biological father (Poor Dad) and his best friend's father (Rich Dad).

The book explains the difference between working for money and having money work for you, emphasizing financial education and building assets.`,
      keyInsights: JSON.stringify([
        'The rich don\'t work for money - they make money work for them',
        'Assets put money in your pocket; liabilities take money out',
        'Focus on building income-generating assets, not just earning a salary',
        'Financial literacy is more important than high income',
        'Pay yourself first before paying bills or taxes',
        'Mind your own business - build your asset column while working your job',
        'The single most powerful asset we have is our mind',
      ]),
      quotes: JSON.stringify([
        'The single most powerful asset we all have is our mind.',
        'The poor and middle class work for money. The rich have money work for them.',
        'Intelligence solves problems and produces money.',
        'Financial freedom is available to those who learn about it and work for it.',
      ]),
      chapters: JSON.stringify([
        { title: 'The Rich Don\'t Work for Money', content: 'Lesson from Rich Dad' },
        { title: 'Why Teach Financial Literacy', content: 'Understanding assets vs liabilities' },
        { title: 'Mind Your Own Business', content: 'Focus on your asset column' },
        { title: 'The History of Taxes', content: 'The power of corporations' },
        { title: 'The Rich Invent Money', content: 'Financial intelligence' },
      ]),
      actionItems: JSON.stringify([
        'List your assets and liabilities - be honest about what\'s what',
        'Start building passive income streams (rental property, dividends, business)',
        'Educate yourself about taxes and legal ways to reduce them',
        'Pay yourself first - save/invest before spending',
        'Focus on acquiring assets, not increasing lifestyle with income',
      ]),
      readingTime: 14,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
      rating: 4.6,
      ratingsCount: 1580,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: businessCat!.id,
      tags: JSON.stringify(['finance', 'investing', 'wealth', 'financial-literacy']),
      amazonLink: 'https://www.amazon.com/dp/1612680194',
      publishedYear: 1997,
    },
  ];

  console.log('Creating books...');
  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({
    where: { email: 'test@bookdigest.com' },
    update: {},
    create: {
      email: 'test@bookdigest.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      subscriptionType: 'PREMIUM_MONTHLY',
      booksRead: 2,
      totalReadingTime: 1800,
      currentStreak: 5,
      longestStreak: 12,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('\n📚 Sample data created:');
  console.log('- 6 categories');
  console.log('- 4 books (Atomic Habits, Think and Grow Rich, 7 Habits, Rich Dad Poor Dad)');
  console.log('- 1 test user (test@bookdigest.com / password123)');
  console.log('\n🚀 You can now start the application!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
