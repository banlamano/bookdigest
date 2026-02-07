'use client';

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BookDigest',
    url: 'https://bookdigest-iota.vercel.app',
    description: 'AI-powered book summaries for business, self-help, and personal development books',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bookdigest-iota.vercel.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BookStructuredData({ book }: { book: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    description: book.description || `Summary of ${book.title} by ${book.author}`,
    image: book.coverImage,
    isbn: book.isbn,
    genre: book.category?.name,
    aggregateRating: book.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: book.rating,
          reviewCount: book.ratingsCount || 1,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BookDigest',
    url: 'https://bookdigest-iota.vercel.app',
    logo: 'https://bookdigest-iota.vercel.app/icon-192.png',
    description: 'AI-powered book summaries platform',
    sameAs: [
      // Add your social media URLs when you have them
      // 'https://twitter.com/bookdigest',
      // 'https://facebook.com/bookdigest',
      // 'https://linkedin.com/company/bookdigest',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
