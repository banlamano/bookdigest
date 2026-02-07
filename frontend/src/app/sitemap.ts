import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bookdigest-iota.vercel.app';
  
  // Return a basic sitemap with static pages
  // Books and categories will be discovered through Google crawling
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

  return routes;
}
