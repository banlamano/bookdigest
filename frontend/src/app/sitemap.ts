import { MetadataRoute } from 'next';
import { generateBookSlug } from '@/lib/slugs';
import { blogPosts } from '@/content/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
// The retries below can outlive the default serverless timeout; a cold Render
// backend needs the headroom.
export const maxDuration = 60;

/**
 * Fetch JSON from the API, retrying a cold/slow backend.
 *
 * Throws if it never succeeds. That is deliberate: this sitemap used to swallow
 * failures and return [], which shipped a perfectly valid HTTP 200 sitemap
 * listing only the ~27 static pages. Google does not read that as "the fetch
 * broke" — it reads it as "this site has 27 pages", i.e. an active claim that
 * the 900+ book URLs no longer exist. A thrown error surfaces as 5xx instead,
 * and Google keeps the last good sitemap and retries later.
 */
async function fetchApi(path: string, attempts = 3): Promise<any> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        // No fetch-level cache: a bad response must never be cached for an hour.
        // Caching happens at the route level once the whole sitemap succeeded.
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(`API status: ${data.status}`);
      }
      return data.data;
    } catch (error) {
      lastError = error;
      console.error(`Sitemap fetch failed (${path}, attempt ${attempt}/${attempts}):`, error);
      // Render spins the free-tier backend down; the first hit pays the cold start.
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw new Error(`Sitemap: could not fetch ${path} after ${attempts} attempts: ${lastError}`);
}

async function getBooks() {
  // /api/books/slugs returns every book (EN + DE) with just the fields this
  // sitemap needs. The old call — /api/books?limit=2000&language=all — pulled
  // full summaries and chapter content for 900+ books: ~28 MB, ~13 s warm,
  // which timed out whenever Render was cold and produced a book-less sitemap.
  const data = await fetchApi('/api/books/slugs');
  const books = data?.books;

  // An empty catalog is never legitimate here — treat it like a failed fetch
  // rather than publishing a sitemap that drops every book page.
  if (!Array.isArray(books) || books.length === 0) {
    throw new Error('Sitemap: book list came back empty, refusing to publish a truncated sitemap');
  }
  return books;
}

async function getCategories() {
  const data = await fetchApi('/api/categories');
  const categories = data?.categories;

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('Sitemap: category list came back empty, refusing to publish a truncated sitemap');
  }
  return categories;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://book-digest.com';
  
  // Static pages with optimized priorities
  const staticPages = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/de', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/categories', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/features', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/library', priority: 0.8, changeFrequency: 'daily' as const },
    // /search removed — search results pages have no canonical content; layout.tsx sets noindex.
    // /login and /register removed — they're blocked by robots.txt and shouldn't rank in search.
    // Their presence in the sitemap caused "Blocked by robots.txt" / "Crawled not indexed" warnings.
    { route: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Blog posts — sourced from the content registry so new generated posts
  // appear here automatically.
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const routes = staticPages.map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Both in parallel: run sequentially, two cold-start retry chains could
  // together outlast maxDuration and turn a recoverable delay into a timeout.
  const [books, categories] = await Promise.all([getBooks(), getCategories()]);

  // Books - highest priority for popular/recent books
  const bookUrls = books.map((book: any) => {
    // Higher priority for recently updated books
    const updatedAt = book.updatedAt || book.createdAt || new Date();
    const isRecent = (new Date().getTime() - new Date(updatedAt).getTime()) < 30 * 24 * 60 * 60 * 1000; // 30 days
    
    return {
      url: `${baseUrl}/books/${book.slug || generateBookSlug(book.title, book.id)}`,
      lastModified: new Date(updatedAt),
      changeFrequency: isRecent ? 'weekly' as const : 'monthly' as const,
      priority: isRecent ? 0.8 : 0.7,
    };
  });

  // Categories - very important for SEO
  const categoryUrls = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Combine all URLs with categories first (most important)
  return [...routes, ...categoryUrls, ...blogUrls, ...bookUrls];
}
