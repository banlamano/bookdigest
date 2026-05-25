import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Unique 90-130 word descriptions for each category. Adding these gives Google
 * something distinct per category page (currently all rendered the same template
 * with just "12 books in this category"), which fixes the "Crawled - currently
 * not indexed" warning for /categories/* pages.
 */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  business:
    "Business book summaries on strategy, operations, and growth. Read condensed versions of bestsellers from authors like Peter Drucker, Jim Collins, and Eric Ries. Each summary distills the core framework — Lean Startup, OKRs, Blue Ocean Strategy — into 15 minutes of actionable reading. Best for founders, managers, and operators who need to think strategically without losing a full week to a single book. Includes Good to Great, The Lean Startup, Built to Last, Zero to One, Measure What Matters, and 80+ more titles. Whether you're scaling a startup or running a department, these summaries help you absorb the playbooks of top business thinkers fast.",
  'self-help':
    "Self-help summaries for personal growth, habits, and mindset. Read the essence of Atomic Habits by James Clear, The Subtle Art of Not Giving a F*ck by Mark Manson, The 7 Habits of Highly Effective People by Stephen Covey, and many more — distilled to their most useful insights in 15 minutes each. Focus on behavior change that actually sticks: tiny daily habits, mental models for difficult decisions, and frameworks for staying focused in a distracted world. Best for readers who want practical takeaways they can apply Monday morning, not abstract philosophy. Includes 80+ titles covering motivation, discipline, identity, and life design.",
  psychology:
    "Psychology summaries covering cognitive biases, behavior, and decision-making. Read the key insights from Thinking, Fast and Slow by Daniel Kahneman, Influence by Robert Cialdini, Predictably Irrational by Dan Ariely, and dozens more — each in 15 minutes. Understand how anchoring, loss aversion, social proof, and the availability heuristic shape every decision you make. Best for product designers, marketers, negotiators, and anyone who wants to think more clearly. Each summary highlights the experiments, frameworks, and quotes that matter most — without the academic detour. Includes Stumbling on Happiness, Drive, Switch, and 50+ titles on how the human mind actually works.",
  productivity:
    "Productivity book summaries on focus, time management, and getting things done. Read the core ideas of Deep Work by Cal Newport, Getting Things Done by David Allen, The 4-Hour Workweek by Tim Ferriss, and Atomic Habits — each condensed to 15-minute reads. Stop reading time-management theory and start applying it: weekly reviews, time-blocking, distraction elimination, batch processing. Best for knowledge workers, students, and freelancers who want fewer meetings, more output, and zero burnout. Covers async work, deep focus, single-tasking, and rest as a competitive advantage. 40+ titles spanning Cal Newport, David Allen, Greg McKeown, Nir Eyal, and other key productivity authors.",
  leadership:
    "Leadership book summaries on management, teams, and organizational behavior. Read the essentials of Leaders Eat Last by Simon Sinek, Radical Candor by Kim Scott, The Hard Thing About Hard Things by Ben Horowitz, Multipliers by Liz Wiseman, and many more — each in 15 minutes. Practical frameworks for tough conversations, building trust, delegating without micromanaging, and growing people. Best for new managers, founders, and team leads who want to lead better without going to business school. Includes Extreme Ownership, Drive, Start with Why, Dare to Lead, and 60+ titles spanning servant leadership, executive presence, and high-performance team building.",
  finance:
    "Personal finance and investing book summaries. Read the core ideas from The Psychology of Money by Morgan Housel, Rich Dad Poor Dad by Robert Kiyosaki, The Intelligent Investor by Benjamin Graham, I Will Teach You to Be Rich by Ramit Sethi, and many more — distilled to 15-minute reads. Frameworks for building wealth: index investing, compound interest, asset allocation, emergency funds, debt strategies. Best for anyone serious about long-term financial independence without falling for crypto hype or get-rich-quick schemes. Covers passive investing, real estate, FIRE movement, behavioral finance, and tax planning. 40+ titles from Warren Buffett's principles to Dave Ramsey's debt snowball.",
  biography:
    "Biographies and memoirs of leaders, entrepreneurs, scientists, and artists. Read the essence of Steve Jobs by Walter Isaacson, Elon Musk biographies, Educated by Tara Westover, Becoming by Michelle Obama, Born a Crime by Trevor Noah, and many more — each in 15 minutes. The decisions, failures, and inflection points that shaped iconic lives, without the 600-page commitment. Best for readers who want to learn from successful people's actual paths — including the parts that didn't go to plan. Covers Bill Gates, Phil Knight, Ray Dalio, Ben Franklin, Marcus Aurelius, and 60+ other titles spanning Silicon Valley, politics, science, and the arts.",
  health:
    "Health, fitness, and nutrition book summaries. Read the key insights from Why We Sleep by Matthew Walker, Outlive by Peter Attia, The Power of Now by Eckhart Tolle, Atomic Habits applied to health, and many more — distilled to 15-minute reads. Evidence-based frameworks for longevity, sleep optimization, exercise that actually works, and mental health. Best for readers tired of fitness influencer noise who want what the research actually says. Covers strength training, fasting, gut health, meditation, stress management, and chronic disease prevention. 40+ titles from Andrew Huberman-adjacent science to Eastern wisdom traditions, including The Stress-Proof Brain, Breath, Lifespan, and Why We Get Fat.",
  science:
    "Science and technology book summaries. Read the core ideas of Sapiens by Yuval Noah Harari, A Brief History of Time by Stephen Hawking, The Selfish Gene by Richard Dawkins, The Gene by Siddhartha Mukherjee, and many more — each in 15 minutes. From quantum physics to evolutionary biology to artificial intelligence, these summaries pull out the conceptual leaps without making you slog through equations. Best for curious generalists who want to understand the universe better than their high-school science class allowed. Covers astrophysics, neuroscience, climate, AI, and the history of scientific discovery. 50+ titles spanning Carl Sagan, Brian Greene, Oliver Sacks, and contemporary thinkers.",
  history:
    "History book summaries spanning ancient empires, world wars, and modern revolutions. Read the essence of Sapiens by Yuval Noah Harari, Guns, Germs, and Steel by Jared Diamond, The Rise and Fall of the Third Reich by William Shirer, 1776 by David McCullough, and many more — each in 15 minutes. Major events, key turning points, and the patterns that repeat across centuries — without the 1,000-page volume. Best for readers who want to understand how the present was made by the past, with enough depth to actually discuss it. Covers Roman history, World War II, the Cold War, decolonization, and economic history. 40+ titles from Yuval Harari to Mary Beard to Robert Caro.",
};

async function main() {
  console.log('📝 Backfilling category descriptions for SEO\n');

  let updated = 0;
  for (const [slug, description] of Object.entries(CATEGORY_DESCRIPTIONS)) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) {
      console.log(`  ⚠️  No category with slug "${slug}" — skipped`);
      continue;
    }
    await prisma.category.update({ where: { slug }, data: { description } });
    console.log(`  ✓ ${slug.padEnd(15)} (${description.length} chars)`);
    updated++;
  }

  console.log(`\n✨ Updated ${updated} categories.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
