import { Metadata } from 'next';

export const siteMetadata = {
  title: 'BookDigest - AI-Powered Book Summaries',
  description: 'Discover over 454 AI-generated book summaries for business, self-help, and personal development books. Learn from the best books in minutes, not hours.',
  siteUrl: 'https://bookdigest-iota.vercel.app',
  author: 'BookDigest',
  keywords: [
    'book summaries',
    'book summary',
    'AI book summaries',
    'business books',
    'self-help books',
    'personal development',
    'productivity books',
    'leadership books',
    'book recommendations',
    'quick book summaries',
    'learn faster',
    'book insights',
    'key takeaways',
    'executive summaries',
    'book notes',
  ],
  social: {
    twitter: '@bookdigest',
    facebook: 'bookdigest',
  },
};

export function generateDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: siteMetadata.title,
      template: `%s | ${siteMetadata.title}`,
    },
    description: siteMetadata.description,
    keywords: siteMetadata.keywords,
    authors: [{ name: siteMetadata.author }],
    creator: siteMetadata.author,
    publisher: siteMetadata.author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteMetadata.siteUrl,
      title: siteMetadata.title,
      description: siteMetadata.description,
      siteName: siteMetadata.title,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: siteMetadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteMetadata.title,
      description: siteMetadata.description,
      images: ['/og-image.png'],
      creator: siteMetadata.social.twitter,
    },
    alternates: {
      canonical: siteMetadata.siteUrl,
    },
  };
}

export function generateBookMetadata(book: {
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  category?: { name: string };
  rating?: number;
}): Metadata {
  const bookTitle = `${book.title} by ${book.author} - Summary & Key Insights`;
  const bookDescription = book.description
    ? `${book.description.substring(0, 150)}...`
    : `Read our AI-generated summary of ${book.title} by ${book.author}. Get key insights, takeaways, and action items in minutes.`;

  return {
    title: bookTitle,
    description: bookDescription,
    keywords: [
      book.title,
      book.author,
      `${book.title} summary`,
      `${book.author} book`,
      book.category?.name || '',
      'book summary',
      'book notes',
      'key insights',
    ].filter(Boolean),
    openGraph: {
      title: bookTitle,
      description: bookDescription,
      type: 'article',
      images: book.coverImage
        ? [
            {
              url: book.coverImage,
              width: 400,
              height: 600,
              alt: `${book.title} book cover`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: bookTitle,
      description: bookDescription,
      images: book.coverImage ? [book.coverImage] : undefined,
    },
    alternates: {
      canonical: `${siteMetadata.siteUrl}/books/${book.title.toLowerCase().replace(/\s+/g, '-')}`,
    },
  };
}

export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
}): Metadata {
  const categoryTitle = `${category.name} Books - Summaries & Insights`;
  const categoryDescription =
    category.description ||
    `Explore AI-generated summaries of the best ${category.name.toLowerCase()} books. Learn from top authors and get key insights in minutes.`;

  return {
    title: categoryTitle,
    description: categoryDescription,
    keywords: [
      category.name,
      `${category.name} books`,
      `${category.name} book summaries`,
      'book recommendations',
      'best books',
    ],
    openGraph: {
      title: categoryTitle,
      description: categoryDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: categoryTitle,
      description: categoryDescription,
    },
  };
}
