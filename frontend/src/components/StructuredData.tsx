'use client';

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BookDigest',
    alternateName: 'Book Digest',
    url: 'https://book-digest.com',
    description: 'Free AI-powered book summaries for 900+ bestselling books in business, self-help, psychology & personal development. Learn from books in 15 minutes.',
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'BookDigest',
      logo: {
        '@type': 'ImageObject',
        url: 'https://book-digest.com/icon.svg',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://book-digest.com/search?q={search_term_string}',
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
  // Only include aggregateRating/review when real user reviews exist.
  // Faking these is a Google policy violation (manipulation of search results).
  const hasRealReviews = (book.ratingsCount ?? 0) > 0 && (book.rating ?? 0) > 0;

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    description: book.description || `AI-powered summary of ${book.title} by ${book.author}. Get key insights, quotes, and action items.`,
    image: book.coverImage,
    isbn: book.isbn,
    genre: book.category?.name,
    inLanguage: book.language || 'en',
    bookFormat: 'https://schema.org/EBook',
    datePublished: book.publishedYear,
    publisher: {
      '@type': 'Organization',
      name: 'BookDigest'
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'EUR',
      url: `https://book-digest.com/books/${book.slug || book.id}`,
    },
  };

  if (hasRealReviews) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      reviewCount: book.ratingsCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

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
    alternateName: 'Book Digest',
    url: 'https://book-digest.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://book-digest.com/icon.svg',
      width: 192,
      height: 192,
    },
    description: 'Free AI-powered book summaries platform. Access 900+ bestselling book summaries in business, self-help, psychology & personal development. Learn from books in 15 minutes.',
    foundingDate: '2026',
    slogan: 'Learn from 900+ Books in 15 Minutes',
    knowsAbout: [
      'Book Summaries',
      'AI Content Generation',
      'Personal Development',
      'Business Education',
      'Self-Help',
      'Book Reviews',
    ],
    sameAs: [
      // Add your social media URLs when you have them
      // 'https://twitter.com/bookdigest',
      // 'https://facebook.com/bookdigest',
      // 'https://linkedin.com/company/bookdigest',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
