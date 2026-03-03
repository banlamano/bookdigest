import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

async function getBooks() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books?limit=1000`, {
      next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data.status === 'success' && data.data?.books ? data.data.books : [];
  } catch (error) {
    console.error('Error fetching books for sitemap:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data.status === 'success' ? data.data.categories : [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://book-digest.com';
  
  // Static pages with optimized priorities
  const staticPages = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/categories', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/features', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/library', priority: 0.8, changeFrequency: 'daily' as const },
    { route: '/search', priority: 0.7, changeFrequency: 'weekly' as const },
    { route: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/register', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Blog posts
  const blogPosts = [
    { slug: 'top-10-business-books-2026', date: '2026-02-09' },
    { slug: 'how-to-read-more-books', date: '2026-02-09' },
  ];

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

  // Get all books - highest priority for popular/recent books
  const books = await getBooks();
  const bookUrls = books.map((book: any) => {
    // Higher priority for recently updated books
    const isRecent = book.updatedAt && 
      (new Date().getTime() - new Date(book.updatedAt).getTime()) < 30 * 24 * 60 * 60 * 1000; // 30 days
    
    return {
      url: `${baseUrl}/books/${book.id}`,
      lastModified: new Date(book.updatedAt || book.createdAt),
      changeFrequency: isRecent ? 'weekly' as const : 'monthly' as const,
      priority: isRecent ? 0.8 : 0.7,
    };
  });

  // Get all categories - very important for SEO
  const categories = await getCategories();
  const categoryUrls = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Combine all URLs with categories first (most important)
  return [...routes, ...categoryUrls, ...blogUrls, ...bookUrls];
}
