import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - Book Summaries, Reading Tips & Productivity',
  description: 'Read articles about book summaries, reading strategies, productivity tips, and personal development. Learn how to read more books and retain more knowledge.',
  keywords: [
    'book summary blog',
    'reading tips',
    'productivity blog',
    'personal development blog',
    'how to read more books',
    'book recommendations',
    'learning strategies',
  ],
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'top-10-business-books-2026',
    title: 'Top 10 Business Books to Read in 2026',
    excerpt: 'Discover the must-read business books of 2026. From leadership to strategy, these summaries will transform your business mindset.',
    date: '2026-02-09',
    readTime: '8 min read',
    category: 'Business',
  },
  {
    slug: 'how-to-read-more-books',
    title: 'How to Read More Books in Less Time: 7 Proven Strategies',
    excerpt: 'Learn science-backed techniques to read faster, remember more, and get through your reading list efficiently.',
    date: '2026-02-09',
    readTime: '10 min read',
    category: 'Productivity',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            BookDigest Blog
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Tips, strategies, and insights to help you read more, learn faster, and grow personally.
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
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            More articles coming soon! Subscribe to get notified.
          </p>
        </div>
      </div>
    </div>
  );
}
