import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

async function getBooks() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books?limit=1000`, {
      next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data.success ? data.data : [];
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
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bookdigest-iota.vercel.app';
  
  // Static pages
  const routes = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/login',
    '/register',
    '/library',
    '/categories',
    '/search',
    '/terms',
    '/privacy',
    '/cookies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Get all books
  const books = await getBooks();
  const bookUrls = books.map((book: any) => ({
    url: `${baseUrl}/books/${book.id}`,
    lastModified: new Date(book.updatedAt || book.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Get all categories
  const categories = await getCategories();
  const categoryUrls = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...categoryUrls, ...bookUrls];
}
