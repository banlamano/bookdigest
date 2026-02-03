import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding extended database with more books...');

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
  ];

  console.log('Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // Get categories
  const businessCat = await prisma.category.findUnique({ where: { slug: 'business' } });
  const selfHelpCat = await prisma.category.findUnique({ where: { slug: 'self-help' } });
  const productivityCat = await prisma.category.findUnique({ where: { slug: 'productivity' } });
  const psychologyCat = await prisma.category.findUnique({ where: { slug: 'psychology' } });
  const leadershipCat = await prisma.category.findUnique({ where: { slug: 'leadership' } });
  const financeCat = await prisma.category.findUnique({ where: { slug: 'finance' } });
  const biographyCat = await prisma.category.findUnique({ where: { slug: 'biography' } });
  const healthCat = await prisma.category.findUnique({ where: { slug: 'health' } });

  // Extended book list with proper covers
  const books = [
    // Productivity & Self-Help
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '9780735211292',
      coverImage: 'https://m.media-amazon.com/images/I/51B7kuGJ8TL._SY466_.jpg',
      summary: `Atomic Habits is a comprehensive guide to breaking bad habits and adopting good ones. James Clear presents a proven framework for improving every day through tiny changes that compound into remarkable results.

The book introduces the four laws of behavior change and explains how small habits are the compound interest of self-improvement. Clear emphasizes that success is the product of daily habits, not once-in-a-lifetime transformations.

Key concepts include habit stacking, the two-minute rule, and environment design. The book provides practical strategies for making good habits inevitable and bad habits impossible.`,
      keyInsights: JSON.stringify([
        '1% better every day leads to 37x improvement in a year through compound effects',
        'Make it obvious: Design your environment to make good habits easier',
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
      ]),
      readingTime: 15,
      rating: 4.8,
      ratingsCount: 1250,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: productivityCat!.id,
      tags: JSON.stringify(['productivity', 'self-improvement', 'habits']),
      amazonLink: 'https://www.amazon.com/dp/0735211299',
      publishedYear: 2018,
    },
    {
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen R. Covey',
      isbn: '9781982137274',
      coverImage: 'https://m.media-amazon.com/images/I/51S35UENpwL._SY466_.jpg',
      summary: `Stephen Covey presents a principle-centered approach for solving personal and professional problems. The book teaches seven habits that lead to effectiveness and lasting success.

These habits move from dependence to independence to interdependence, creating a framework for personal and organizational effectiveness. The book emphasizes character ethics over personality ethics.

Covey's approach is holistic, integrated, and principle-centered, focusing on developing character and becoming more effective through aligning yourself with timeless principles.`,
      keyInsights: JSON.stringify([
        'Be Proactive - Take responsibility for your life and choices',
        'Begin with the End in Mind - Define your mission and goals in life',
        'Put First Things First - Prioritize important activities over urgent ones',
        'Think Win-Win - Seek mutual benefit in all interactions',
        'Seek First to Understand, Then to Be Understood - Practice empathetic listening',
        'Synergize - Combine strengths through positive teamwork',
        'Sharpen the Saw - Balance and renew your resources, energy, and health',
      ]),
      quotes: JSON.stringify([
        'Most people do not listen with the intent to understand; they listen with the intent to reply.',
        'To change ourselves effectively, we first had to change our perceptions.',
        'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.',
        'Sow a thought, reap an action; sow an action, reap a habit; sow a habit, reap a character.',
      ]),
      chapters: JSON.stringify([
        { title: 'Paradigms and Principles', content: 'Inside-out approach to change' },
        { title: 'Private Victory', content: 'Habits 1-3: Independence and self-mastery' },
        { title: 'Public Victory', content: 'Habits 4-6: Interdependence and collaboration' },
        { title: 'Renewal', content: 'Habit 7: Continuous improvement and balance' },
      ]),
      actionItems: JSON.stringify([
        'Write your personal mission statement',
        'Use the Eisenhower Matrix to prioritize tasks (urgent/important)',
        'Practice empathetic listening for one week',
        'Identify one area where you can think win-win instead of win-lose',
      ]),
      readingTime: 16,
      rating: 4.9,
      ratingsCount: 2100,
      isPremium: 1,
      isFeatured: 1,
      isPublished: 1,
      categoryId: selfHelpCat!.id,
      tags: JSON.stringify(['effectiveness', 'habits', 'personal-development']),
      amazonLink: 'https://www.amazon.com/dp/1982137274',
      publishedYear: 1989,
    },
    {
      title: 'Think and Grow Rich',
      author: 'Napoleon Hill',
      isbn: '9781585424337',
      coverImage: 'https://m.media-amazon.com/images/I/71UypkUjStL._SY466_.jpg',
      summary: `Think and Grow Rich is one of the best-selling books of all time. Napoleon Hill interviewed over 500 successful people including Andrew Carnegie, Thomas Edison, and Henry Ford to discover the secrets of success.

The book presents 13 principles for achieving success and wealth, emphasizing the power of thought, desire, faith, and persistence. It's not just about money - it's about achieving success in all areas of life.

Hill's philosophy is that thoughts are things, and by controlling our thoughts, we can control our destiny. The book provides a blueprint for turning dreams into reality.`,
      keyInsights: JSON.stringify([
        'Thoughts are things - what you think about consistently becomes your reality',
        'Desire is the starting point of all achievement - you must want it intensely',
        'Faith and visualization make success inevitable',
        'Specialized knowledge is more valuable than general education',
        'A mastermind group accelerates success exponentially',
        'Persistence is essential - most people quit right before success',
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
        { title: 'Autosuggestion', content: 'Influencing the subconscious mind' },
        { title: 'Specialized Knowledge', content: 'Personal experiences or observations' },
      ]),
      actionItems: JSON.stringify([
        'Write down your definite chief aim - what do you want most?',
        'Create a visualization practice - see yourself achieving your goals',
        'Form or join a mastermind group of like-minded achievers',
        'Read your goals aloud twice daily with faith and emotion',
      ]),
      readingTime: 15,
      rating: 4.7,
      ratingsCount: 890,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: selfHelpCat!.id,
      tags: JSON.stringify(['success', 'wealth', 'mindset']),
      amazonLink: 'https://www.amazon.com/dp/1585424331',
      publishedYear: 1937,
    },
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert T. Kiyosaki',
      isbn: '9781612680194',
      coverImage: 'https://m.media-amazon.com/images/I/81bsw6fnUiL._SY466_.jpg',
      summary: `Rich Dad Poor Dad challenges conventional wisdom about money and investing. Robert Kiyosaki shares lessons from his two "dads" - his biological father (Poor Dad) and his best friend's father (Rich Dad).

The book explains the difference between working for money and having money work for you, emphasizing financial education and building assets. Kiyosaki argues that financial literacy is not taught in schools, leading to a lifetime of financial struggle.

Key themes include understanding assets vs liabilities, the importance of financial education, and thinking like an entrepreneur rather than an employee.`,
      keyInsights: JSON.stringify([
        'The rich don\'t work for money - they make money work for them',
        'Assets put money in your pocket; liabilities take money out',
        'Focus on building income-generating assets, not just earning a salary',
        'Financial literacy is more important than high income',
        'Pay yourself first before paying bills or taxes',
        'Mind your own business - build your asset column while working your job',
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
      ]),
      actionItems: JSON.stringify([
        'List your assets and liabilities - be honest about what\'s what',
        'Start building passive income streams',
        'Educate yourself about taxes and legal ways to reduce them',
        'Pay yourself first - save/invest before spending',
      ]),
      readingTime: 14,
      rating: 4.6,
      ratingsCount: 1580,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: financeCat!.id,
      tags: JSON.stringify(['finance', 'investing', 'wealth']),
      amazonLink: 'https://www.amazon.com/dp/1612680194',
      publishedYear: 1997,
    },

    // More Books - Psychology
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '9780374533557',
      coverImage: 'https://m.media-amazon.com/images/I/71TRVmB6XJL._SY466_.jpg',
      summary: `Nobel Prize winner Daniel Kahneman reveals the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.

The book explores how these two systems shape our judgments and decisions, and reveals where we can trust our intuitions and how we can tap into the benefits of slow thinking. It offers practical insights into how choices are made in both our business and personal lives.`,
      keyInsights: JSON.stringify([
        'System 1 thinking is automatic and requires little effort',
        'System 2 thinking is deliberate and requires mental effort',
        'We are overconfident in our own judgments and predictions',
        'Loss aversion is more powerful than the desire for gains',
        'Anchoring affects our decisions more than we realize',
        'The availability heuristic leads us to overestimate dramatic events',
      ]),
      quotes: JSON.stringify([
        'Nothing in life is as important as you think it is while you are thinking about it.',
        'A reliable way to make people believe in falsehoods is frequent repetition.',
        'The confidence people have in their beliefs is not a measure of the quality of evidence.',
      ]),
      chapters: JSON.stringify([
        { title: 'Two Systems', content: 'Fast and slow thinking processes' },
        { title: 'Heuristics and Biases', content: 'Mental shortcuts and errors' },
        { title: 'Overconfidence', content: 'The illusion of understanding' },
      ]),
      actionItems: JSON.stringify([
        'Pause before making important decisions to engage System 2',
        'Be aware of anchoring in negotiations',
        'Question your first impressions and intuitions',
      ]),
      readingTime: 18,
      rating: 4.6,
      ratingsCount: 980,
      isPremium: 1,
      isFeatured: 1,
      isPublished: 1,
      categoryId: psychologyCat!.id,
      tags: JSON.stringify(['psychology', 'decision-making', 'cognitive-bias']),
      amazonLink: 'https://www.amazon.com/dp/0374533555',
      publishedYear: 2011,
    },

    // Leadership
    {
      title: 'Leaders Eat Last',
      author: 'Simon Sinek',
      isbn: '9781591848011',
      coverImage: 'https://m.media-amazon.com/images/I/71dFpTSzsYL._SY466_.jpg',
      summary: `Simon Sinek explores why some teams pull together and others don't. He explains that great leaders sacrifice their own comfort for the good of those in their care.

The title comes from the Marine Corps tradition where officers eat last, ensuring their people are taken care of first. This creates a Circle of Safety where team members feel secure and supported.

Sinek reveals how leaders can inspire cooperation, trust, and change by prioritizing the well-being of their people over their own interests.`,
      keyInsights: JSON.stringify([
        'Great leaders create a Circle of Safety for their team',
        'When people feel safe, they naturally collaborate and innovate',
        'Leadership is about taking care of those in your charge',
        'Trust and cooperation are biologically driven responses',
        'The responsibility of leadership is to put others before yourself',
        'Modern work environments often trigger survival instincts',
      ]),
      quotes: JSON.stringify([
        'Leadership is not about being in charge. It is about taking care of those in your charge.',
        'When we feel safe inside an organization, we will naturally combine our talents and strengths.',
        'Courage is not the absence of fear, but the judgment that something else is more important.',
      ]),
      chapters: JSON.stringify([
        { title: 'The Circle of Safety', content: 'Creating trust and cooperation' },
        { title: 'The Biology of Leadership', content: 'How chemicals affect behavior' },
        { title: 'Modern Challenges', content: 'Adapting leadership to today\'s world' },
      ]),
      actionItems: JSON.stringify([
        'Identify ways to create more safety in your team',
        'Practice servant leadership - put your team first',
        'Build trust by being vulnerable and honest',
      ]),
      readingTime: 16,
      rating: 4.7,
      ratingsCount: 760,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: leadershipCat!.id,
      tags: JSON.stringify(['leadership', 'management', 'teamwork']),
      amazonLink: 'https://www.amazon.com/dp/1591845327',
      publishedYear: 2014,
    },

    // More Productivity
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      isbn: '9781455586691',
      coverImage: 'https://m.media-amazon.com/images/I/71gCdy39WxL._SY466_.jpg',
      summary: `Deep Work argues that the ability to focus without distraction is becoming increasingly rare and valuable in our economy. Cal Newport defines deep work as professional activities performed in a state of distraction-free concentration.

The book provides strategies for developing this skill in an increasingly distracted world. Newport argues that deep work is necessary to wring every last drop of value out of your current intellectual capacity.

He presents four rules for transforming your mind and habits to support deep work in your professional life.`,
      keyInsights: JSON.stringify([
        'Deep work is the ability to focus without distraction on cognitively demanding tasks',
        'Shallow work is non-cognitively demanding, logistical tasks',
        'Deep work is valuable, rare, and meaningful',
        'Network tools are engineered to be addictive and fragment attention',
        'Schedule every minute of your day to protect deep work time',
        'Embrace boredom to strengthen your focus muscles',
      ]),
      quotes: JSON.stringify([
        'The ability to perform deep work is becoming increasingly rare and therefore increasingly valuable.',
        'Clarity about what matters provides clarity about what does not.',
        'If you don\'t produce, you won\'t thrive—no matter how skilled or talented you are.',
      ]),
      chapters: JSON.stringify([
        { title: 'Deep Work is Valuable', content: 'Why focus matters more than ever' },
        { title: 'Deep Work is Rare', content: 'The distracted modern workplace' },
        { title: 'Deep Work is Meaningful', content: 'The satisfaction of focused work' },
        { title: 'The Rules', content: 'Four rules for deep work' },
      ]),
      actionItems: JSON.stringify([
        'Schedule blocks of deep work time in your calendar',
        'Remove or limit distracting apps and websites',
        'Create a shutdown ritual to end your workday',
        'Embrace boredom instead of reaching for your phone',
      ]),
      readingTime: 15,
      rating: 4.6,
      ratingsCount: 1120,
      isPremium: 1,
      isFeatured: 1,
      isPublished: 1,
      categoryId: productivityCat!.id,
      tags: JSON.stringify(['productivity', 'focus', 'performance']),
      amazonLink: 'https://www.amazon.com/dp/1455586692',
      publishedYear: 2016,
    },

    {
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      isbn: '9781577314806',
      coverImage: 'https://m.media-amazon.com/images/I/71gCdy39WxL._SY466_.jpg',
      summary: `The Power of Now shows readers how to recognize themselves as the creator of their own pain and how to have a pain-free identity by living fully in the present.

Eckhart Tolle teaches that the key to happiness is to be present in the moment and to accept what is. The book guides readers to connect with their authentic selves by being fully present.

Tolle's message is simple but profound: living in the Now is the truest path to happiness and enlightenment.`,
      keyInsights: JSON.stringify([
        'The present moment is all we ever have',
        'The mind is a tool we should learn to control, not be controlled by',
        'Pain is created by identification with thoughts and emotions',
        'Being present dissolves problems and suffering',
        'The ego is an illusion created by identification with mind',
        'Acceptance of the present moment is the key to inner peace',
      ]),
      quotes: JSON.stringify([
        'Realize deeply that the present moment is all you ever have.',
        'The past gives you an identity and the future holds the promise of salvation.',
        'You are not your mind.',
        'Life is now. There was never a time when your life was not now.',
      ]),
      chapters: JSON.stringify([
        { title: 'You Are Not Your Mind', content: 'Separating from thoughts' },
        { title: 'Consciousness', content: 'The way out of pain' },
        { title: 'Moving Deeply into the Now', content: 'Being present' },
      ]),
      actionItems: JSON.stringify([
        'Practice observing your thoughts without judgment',
        'Bring awareness to your breath throughout the day',
        'Notice when you are dwelling on past or future',
        'Accept the present moment as it is',
      ]),
      readingTime: 14,
      rating: 4.7,
      ratingsCount: 890,
      isPremium: 0,
      isFeatured: 0,
      isPublished: 1,
      categoryId: selfHelpCat!.id,
      tags: JSON.stringify(['mindfulness', 'spirituality', 'present-moment']),
      amazonLink: 'https://www.amazon.com/dp/1577314808',
      publishedYear: 1997,
    },

    // Business
    {
      title: 'The Lean Startup',
      author: 'Eric Ries',
      isbn: '9780307887894',
      coverImage: 'https://m.media-amazon.com/images/I/81vvgZqCskL._SY466_.jpg',
      summary: `The Lean Startup provides a scientific approach to creating and managing startups. Eric Ries defines a startup as an organization dedicated to creating something new under conditions of extreme uncertainty.

The book introduces the Build-Measure-Learn feedback loop and emphasizes validated learning, scientific experimentation, and iterative product releases. The goal is to learn what customers really want and build it as quickly as possible.

Ries advocates for the minimum viable product (MVP) approach and pivoting based on customer feedback.`,
      keyInsights: JSON.stringify([
        'Use the Build-Measure-Learn feedback loop to test hypotheses',
        'Start with a minimum viable product (MVP) to validate assumptions',
        'Validated learning is the process of demonstrating progress',
        'Innovation accounting measures progress when traditional metrics fail',
        'Pivot or persevere based on what you learn from customers',
        'Small batches allow for faster iteration and learning',
      ]),
      quotes: JSON.stringify([
        'The only way to win is to learn faster than anyone else.',
        'Success is not delivering a feature; success is learning how to solve the customer\'s problem.',
        'Build-Measure-Learn is the fundamental activity of a startup.',
      ]),
      chapters: JSON.stringify([
        { title: 'Start', content: 'Entrepreneurial management principles' },
        { title: 'Steer', content: 'Build-Measure-Learn feedback loop' },
        { title: 'Accelerate', content: 'Growing your startup' },
      ]),
      actionItems: JSON.stringify([
        'Identify your riskiest assumption and test it first',
        'Create an MVP to start the Build-Measure-Learn loop',
        'Define actionable metrics that demonstrate real progress',
        'Plan regular intervals to decide whether to pivot or persevere',
      ]),
      readingTime: 15,
      rating: 4.5,
      ratingsCount: 670,
      isPremium: 0,
      isFeatured: 0,
      isPublished: 1,
      categoryId: businessCat!.id,
      tags: JSON.stringify(['entrepreneurship', 'startups', 'innovation']),
      amazonLink: 'https://www.amazon.com/dp/0307887898',
      publishedYear: 2011,
    },

    {
      title: 'Start with Why',
      author: 'Simon Sinek',
      isbn: '9781591846444',
      coverImage: 'https://m.media-amazon.com/images/I/71ncTEAVmKL._SY466_.jpg',
      summary: `Start with Why shows that people won't truly buy into a product, service, movement, or idea until they understand the WHY behind it. Simon Sinek discovered that the most inspiring leaders and organizations think, act, and communicate from the inside out.

The book introduces the Golden Circle: Why, How, and What. Most organizations know WHAT they do, some know HOW they do it, but very few know WHY they do it.

Starting with WHY inspires action and loyalty. It's the reason Apple, Martin Luther King Jr., and the Wright Brothers achieved what others couldn't.`,
      keyInsights: JSON.stringify([
        'People don\'t buy WHAT you do, they buy WHY you do it',
        'The Golden Circle: Start with Why, then How, then What',
        'WHY is your purpose, cause, or belief',
        'Great leaders inspire action by communicating from the inside out',
        'The Law of Diffusion of Innovation: Innovators and early adopters buy into the WHY',
        'When WHY is clear, those who believe what you believe will be drawn to you',
      ]),
      quotes: JSON.stringify([
        'People don\'t buy what you do; they buy why you do it.',
        'There are only two ways to influence human behavior: you can manipulate it or you can inspire it.',
        'If you hire people just because they can do a job, they\'ll work for your money. But if you hire people who believe what you believe, they\'ll work for you with blood, sweat, and tears.',
      ]),
      chapters: JSON.stringify([
        { title: 'Assume You Know', content: 'The manipulation vs inspiration' },
        { title: 'The Golden Circle', content: 'Why, How, What framework' },
        { title: 'Leaders Need a Following', content: 'Building true believers' },
      ]),
      actionItems: JSON.stringify([
        'Define your personal or organizational WHY',
        'Communicate your WHY in everything you do',
        'Hire people who believe what you believe',
        'Make decisions based on your WHY, not just profit',
      ]),
      readingTime: 14,
      rating: 4.6,
      ratingsCount: 810,
      isPremium: 0,
      isFeatured: 1,
      isPublished: 1,
      categoryId: leadershipCat!.id,
      tags: JSON.stringify(['leadership', 'purpose', 'inspiration']),
      amazonLink: 'https://www.amazon.com/dp/1591846447',
      publishedYear: 2009,
    },
  ];

  console.log('Creating books...');
  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: book,
      create: book,
    });
  }

  // Create or update test user
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
      booksRead: 5,
      totalReadingTime: 4500,
      currentStreak: 5,
      longestStreak: 12,
    },
  });

  console.log('✅ Extended seeding completed successfully!');
  console.log('\n📚 Database now contains:');
  console.log('- 8 categories');
  console.log('- 10 books with proper covers');
  console.log('- 1 test user (test@bookdigest.com / password123)');
  console.log('\n🚀 Restart the backend to see the changes!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
