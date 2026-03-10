'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

interface BlogPost {
  slug: string;
  title: string;
  titleDe: string;
  excerpt: string;
  excerptDe: string;
  date: string;
  readTime: string;
  readTimeDe: string;
  category: string;
  categoryDe: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'top-10-business-books-2026',
    title: 'Top 10 Business Books to Read in 2026',
    titleDe: 'Top 10 Business-Bücher für 2026',
    excerpt: 'Discover the must-read business books of 2026. From leadership to strategy, these summaries will transform your business mindset.',
    excerptDe: 'Entdecke die wichtigsten Business-Bücher 2026. Von Führung bis Strategie – diese Zusammenfassungen verändern dein geschäftliches Denken.',
    date: '2026-02-09',
    readTime: '8 min read',
    readTimeDe: '8 Min. Lesezeit',
    category: 'Business',
    categoryDe: 'Wirtschaft',
  },
  {
    slug: 'how-to-read-more-books',
    title: 'How to Read More Books in Less Time: 7 Proven Strategies',
    titleDe: 'Wie man in weniger Zeit mehr Bücher liest: 7 bewährte Strategien',
    excerpt: 'Learn science-backed techniques to read faster, remember more, and get through your reading list efficiently.',
    excerptDe: 'Lerne wissenschaftlich belegte Techniken, um schneller zu lesen, mehr zu behalten und deine Leseliste effizient abzuarbeiten.',
    date: '2026-02-09',
    readTime: '10 min read',
    readTimeDe: '10 Min. Lesezeit',
    category: 'Productivity',
    categoryDe: 'Produktivität',
  },
];

export default function BlogPage() {
  const { t, language } = useLanguage();
  const isDe = language === 'de';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            {t('blog.subtitle')}
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                    {isDe ? post.categoryDe : post.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isDe ? post.readTimeDe : post.readTime}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {isDe ? post.titleDe : post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {isDe ? post.excerptDe : post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {t('blog.readMore')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('blog.comingSoon')}
          </p>
        </div>
      </div>
    </div>
  );
}
