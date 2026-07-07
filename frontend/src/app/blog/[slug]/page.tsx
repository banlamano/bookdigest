import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { marked } from 'marked';
import { getAllPosts, getPost, type BlogPost } from '@/lib/blog';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

function localized(post: BlogPost, isDe: boolean) {
  return {
    title: isDe ? post.titleDe : post.title,
    excerpt: isDe ? post.excerptDe : post.excerpt,
    keywords: isDe ? post.keywordsDe : post.keywords,
    category: isDe ? post.categoryDe : post.category,
    // Older posts have no German body yet — fall back to English content.
    content: isDe && post.contentDe ? post.contentDe : post.contentEn,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  const isDe = cookies().get('language')?.value === 'de';
  const loc = localized(post, isDe);

  return {
    title: loc.title,
    description: loc.excerpt,
    keywords: loc.keywords,
    openGraph: {
      title: loc.title,
      description: loc.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: loc.title,
      description: loc.excerpt,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) {
    notFound();
  }

  const lang = cookies().get('language')?.value || 'en';
  const isDe = lang === 'de';
  const loc = localized(post, isDe);
  const html = marked.parse(loc.content, { async: false }) as string;

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Article Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← {isDe ? 'Zurück zum Blog' : 'Back to Blog'}
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded">
              {loc.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isDe ? `${post.readMinutes} Min. Lesezeit` : `${post.readMinutes} min read`}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {loc.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>{isDe ? 'Von' : 'By'} {post.author}</span>
            <span>•</span>
            <time>
              {new Date(post.date).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            {isDe ? 'Bereit zum Lernen?' : 'Ready to Start Learning?'}
          </h3>
          <p className="text-blue-100 mb-6 text-lg">
            {isDe ? 'Zugang zu 900+ kostenlosen Buchzusammenfassungen auf BookDigest' : 'Access 900+ free book summaries on BookDigest'}
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {isDe ? 'Jetzt kostenlos starten →' : 'Get Started Free →'}
          </Link>
        </div>
      </div>
    </article>
  );
}
