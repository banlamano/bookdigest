import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bookdigest-iota.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

  let books: any[] = [];
  let categories: any[] = [];

  // Fetch all books from API with error handling
  try {
    const booksResponse = await fetch(`${apiUrl}/api/books?page=1&limit=500`, {
      cache: 'no-store',
    });
    
    if (booksResponse.ok) {
      const booksData = await booksResponse.json();
      books = booksData.data?.books || [];
    }
  } catch (error) {
    console.error('Error fetching books for sitemap:', error);
  }

  // Fetch all categories with error handling
  try {
    const categoriesResponse = await fetch(`${apiUrl}/api/categories`, {
      cache: 'no-store',
    });
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      categories = categoriesData.data || [];
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Book pages
  const bookPages = books.map((book: any) => ({
    url: `${baseUrl}/books/${book.id}`,
    lastModified: new Date(book.updatedAt || book.createdAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Category pages
  const categoryPages = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...bookPages, ...categoryPages];
}
