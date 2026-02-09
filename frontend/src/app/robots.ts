import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login', '/register', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login', '/register', '/admin/'],
      },
    ],
    sitemap: 'https://bookdigest-iota.vercel.app/sitemap.xml',
    host: 'https://bookdigest-iota.vercel.app',
  };
}
