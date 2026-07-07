import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Blog post generator — SEO listicle posts built from the real catalog.
 *
 * Picks the top-rated books for a theme, has Gemini write an EN and a DE
 * version that link to the actual /books/<slug> pages, and writes the result
 * as a JSON content file into frontend/src/content/blog/ plus registers it
 * in that folder's index.ts. Publishing is then: review → commit → push
 * (Vercel redeploys).
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/generate-blog-post.ts theme="best psychology books" [category=psychology] [count=10] [--dry]
 *
 *   theme=      what the listicle is about — becomes the editorial angle
 *   category=   optional category slug or name filter for book selection
 *   count=      how many books to feature (default 10)
 *   --dry       show the selected books and stop before calling Gemini
 */

const prisma = new PrismaClient();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is required');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Rotate models to dodge per-model rate limits (same pattern as translate-books).
const MODELLIST = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
];
let modelIndex = 0;

async function askGeminiJson(prompt: string, attempt = 0): Promise<any> {
  const modelName = MODELLIST[modelIndex % MODELLIST.length];
  modelIndex++;
  try {
    console.log(`  🤖 ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(text);
  } catch (err: any) {
    const retryable =
      err.message?.includes('429') ||
      err.message?.includes('quota') ||
      err.message?.includes('503') ||
      err instanceof SyntaxError; // malformed JSON — try another model
    if (retryable && attempt < MODELLIST.length * 2) {
      const waitMs = attempt >= MODELLIST.length ? 60000 : 5000;
      console.log(`  ⚠️  ${err.message?.slice(0, 80)} — retrying in ${waitMs / 1000}s`);
      await new Promise((r) => setTimeout(r, waitMs));
      return askGeminiJson(prompt, attempt + 1);
    }
    throw err;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function camelIdent(slug: string): string {
  const ident = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return /^[0-9]/.test(ident) ? `post${ident}` : ident;
}

interface CliArgs {
  theme: string;
  category?: string;
  count: number;
  dry: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = { theme: '', count: 10, dry: false };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry') args.dry = true;
    else if (arg.startsWith('theme=')) args.theme = arg.slice(6);
    else if (arg.startsWith('category=')) args.category = arg.slice(9);
    else if (arg.startsWith('count=')) args.count = parseInt(arg.slice(6), 10) || 10;
  }
  if (!args.theme) {
    console.error('❌ theme= is required, e.g. theme="best psychology books"');
    process.exit(1);
  }
  return args;
}

const CONTENT_DIR = path.resolve(process.cwd(), '..', 'frontend', 'src', 'content', 'blog');

async function main() {
  const { theme, category, count, dry } = parseArgs();
  console.log(`\n📝 Blog post generator — theme: "${theme}"${category ? ` (category: ${category})` : ''}\n`);

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Content dir not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  // ── 1. Pick the books ────────────────────────────────────────────────
  const enBooks = await prisma.book.findMany({
    where: {
      language: 'en',
      slug: { not: null },
      ...(category
        ? {
            category: {
              OR: [
                { slug: { contains: category, mode: 'insensitive' } },
                { name: { contains: category, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    },
    orderBy: [{ rating: 'desc' }, { ratingsCount: 'desc' }],
    take: count,
    select: {
      title: true,
      author: true,
      slug: true,
      summary: true,
      keyInsights: true,
      category: { select: { name: true } },
    },
  });

  if (enBooks.length < 3) {
    console.error(`❌ Only ${enBooks.length} matching book(s) — not enough for a listicle. Loosen category=?`);
    process.exit(1);
  }

  // DE counterparts are separate rows linked by originalTitle = EN title.
  const deBooks = await prisma.book.findMany({
    where: { language: 'de', originalTitle: { in: enBooks.map((b) => b.title) } },
    select: { title: true, author: true, slug: true, originalTitle: true },
  });
  const deByOriginal = new Map(deBooks.map((b) => [b.originalTitle, b]));

  console.log(`📚 Selected ${enBooks.length} books (${deBooks.length} with German versions):`);
  for (const b of enBooks) {
    const de = deByOriginal.get(b.title);
    console.log(`   • ${b.title} — ${b.author}  [/books/${b.slug}]${de ? `  ⇄ de: /books/${de.slug}` : ''}`);
  }

  if (dry) {
    console.log('\n🔍 DRY RUN — stopping before Gemini. Remove --dry to generate.');
    return;
  }

  // ── 2. Generate the English post ─────────────────────────────────────
  const bookListEn = enBooks
    .map((b, i) => {
      const insights = Array.isArray(b.keyInsights) ? (b.keyInsights as any[]).slice(0, 2).join(' | ') : '';
      return `${i + 1}. "${b.title}" by ${b.author} — link target: /books/${b.slug} — category: ${b.category.name}${insights ? ` — key ideas: ${insights}` : ''}`;
    })
    .join('\n');

  const sharedRules = `
Rules:
- Feature ONLY the books in the list, in an order that makes editorial sense. Never invent books or links.
- Every featured book MUST be linked exactly once as a markdown link to its given /books/<slug> path.
- 900–1300 words. Start directly with an engaging intro paragraph — do NOT include an H1 title heading (the page renders the title separately).
- Structure: intro, a short "why summaries" angle mentioning BookDigest, one ### section per book (with the linked title, why it matters, key takeaway), a practical closing section, and a final call to action linking to /register.
- Tone: knowledgeable, practical, no hype. Written for search intent around the theme.
- Return ONLY valid JSON, no markdown fences, with this exact shape:
  { "title": string, "excerpt": string (max 160 chars), "keywords": string[] (4-6), "category": string (one or two words), "content": string (the markdown body) }`;

  console.log('\n✍️  Generating English post...');
  const en = await askGeminiJson(
    `You write SEO blog posts for BookDigest (book-digest.com), a book-summary platform. Write a listicle blog post in ENGLISH on the theme: "${theme}".

Books to feature:
${bookListEn}
${sharedRules}`
  );

  // ── 3. Generate the German post ──────────────────────────────────────
  const bookListDe = enBooks
    .map((b, i) => {
      const de = deByOriginal.get(b.title);
      // Prefer the German edition's title + slug; fall back to the EN page.
      const title = de?.title ?? b.title;
      const slug = de?.slug ?? b.slug;
      return `${i + 1}. "${title}" von ${b.author} — Link-Ziel: /books/${slug}`;
    })
    .join('\n');

  console.log('✍️  Generating German post...');
  const de = await askGeminiJson(
    `You write SEO blog posts for BookDigest (book-digest.com), a book-summary platform. Write a listicle blog post in GERMAN (natürliches, idiomatisches Deutsch, Leser mit "du" ansprechen) on the theme: "${theme}".

Books to feature (use these German titles and links):
${bookListDe}
${sharedRules}
- The "category" field must be the GERMAN category label.`
  );

  // ── 4. Assemble + write the content file ─────────────────────────────
  let slug = slugify(en.title);
  if (fs.existsSync(path.join(CONTENT_DIR, `${slug}.json`))) {
    slug = `${slug}-${new Date().toISOString().slice(0, 10)}`;
    if (fs.existsSync(path.join(CONTENT_DIR, `${slug}.json`))) {
      console.error(`❌ Post already exists: ${slug}.json`);
      process.exit(1);
    }
  }

  const words = en.content.split(/\s+/).length;
  const post = {
    slug,
    date: new Date().toISOString().slice(0, 10),
    author: 'BookDigest Team',
    category: en.category,
    categoryDe: de.category,
    readMinutes: Math.max(4, Math.round(words / 200)),
    title: en.title,
    titleDe: de.title,
    excerpt: en.excerpt,
    excerptDe: de.excerpt,
    keywords: en.keywords,
    keywordsDe: de.keywords,
    contentEn: en.content,
    contentDe: de.content,
  };

  const file = path.join(CONTENT_DIR, `${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(post, null, 2) + '\n', 'utf8');
  console.log(`\n💾 Wrote ${file}`);

  // ── 5. Register in index.ts via the generator markers ────────────────
  const indexFile = path.join(CONTENT_DIR, 'index.ts');
  const ident = camelIdent(slug);
  let index = fs.readFileSync(indexFile, 'utf8');
  if (index.includes(`'./${slug}.json'`)) {
    console.log('   index.ts already references this post — skipping registration.');
  } else {
    index = index
      .replace('// generator:imports', `// generator:imports\nimport ${ident} from './${slug}.json';`)
      .replace('// generator:posts', `// generator:posts\n  ${ident},`);
    fs.writeFileSync(indexFile, index, 'utf8');
    console.log(`   Registered as "${ident}" in index.ts`);
  }

  console.log(`\n✨ Done — "${en.title}" / "${de.title}"`);
  console.log(`   ${words} words EN, ${de.content.split(/\s+/).length} words DE, ~${post.readMinutes} min read`);
  console.log('\nNext steps: review the JSON, then commit + push to publish:');
  console.log(`   git add frontend/src/content/blog && git commit -m "content(blog): ${slug}" && git push`);
}

main()
  .catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
