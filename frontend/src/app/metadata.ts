import { Metadata } from 'next';

export const siteMetadata = {
  title: 'BookDigest - Learn from 1000+ Books in 15 Minutes | Free AI Book Summaries',
  description: 'Read AI-powered summaries of bestselling books in business, self-help, psychology & personal development. Save 10+ hours per book. Free access to 454+ expert book summaries with key insights, quotes & action items.',
  siteUrl: 'https://book-digest.com',
  author: 'BookDigest',
  keywords: [
    // Primary keywords
    'book summaries',
    'book summary',
    'AI book summaries',
    'free book summaries',
    '15 minute book summary',
    
    // Category keywords
    'business books',
    'business book summaries',
    'self-help books',
    'self-help book summaries',
    'personal development',
    'personal development books',
    'psychology books',
    'productivity books',
    'leadership books',
    'entrepreneurship books',
    
    // Competitive keywords
    'blinkist alternative',
    'shortform alternative',
    'getabstract alternative',
    'instaread alternative',
    'book summary app',
    'book summary website',
    
    // Long-tail keywords
    'learn faster from books',
    'book recommendations',
    'quick book summaries',
    'book insights',
    'key takeaways',
    'executive summaries',
    'book notes',
    'best books to read',
    'top business books',
    'must read books',
    'book digest platform',
    'summarized books online',
    'condensed book summaries',
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
  const bookTitle = `${book.title} by ${book.author} - Free Summary, Key Insights & Quotes`;
  const bookDescription = book.description
    ? `${book.description.substring(0, 140)}... Read the full AI-powered summary free on BookDigest.`
    : `Read our free AI-powered summary of "${book.title}" by ${book.author}. Get key insights, important quotes, and actionable takeaways in 15 minutes. ${book.category?.name ? `Best ${book.category.name} book summary.` : ''}`;

  return {
    title: bookTitle,
    description: bookDescription,
    keywords: [
      // Primary book keywords
      book.title,
      `${book.title} summary`,
      `${book.title} book summary`,
      `${book.title} key takeaways`,
      `${book.title} review`,
      
      // Author keywords
      book.author,
      `${book.author} book`,
      `${book.author} books`,
      
      // Category keywords
      book.category?.name || '',
      `${book.category?.name || ''} books`,
      `best ${book.category?.name || ''} books`,
      
      // Generic keywords
      'book summary',
      'book notes',
      'key insights',
      'book review',
      'free book summary',
      'AI book summary',
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
              alt: `${book.title} by ${book.author} - Book Cover`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.title} Summary - Free AI Book Summary`,
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
  const categoryTitle = `Best ${category.name} Books - Free AI Summaries & Key Insights`;
  const categoryDescription =
    category.description ||
    `Read free AI-powered summaries of the best ${category.name.toLowerCase()} books. Learn from top authors and bestsellers. Get key insights, quotes & action items in 15 minutes. Perfect alternative to Blinkist.`;

  return {
    title: categoryTitle,
    description: categoryDescription,
    keywords: [
      // Primary category keywords
      `${category.name} books`,
      `best ${category.name} books`,
      `${category.name} book summaries`,
      `top ${category.name} books`,
      
      // Long-tail keywords
      `${category.name} book recommendations`,
      `must read ${category.name} books`,
      `popular ${category.name} books`,
      
      // Generic keywords
      'book summaries',
      'free book summaries',
      'AI book summaries',
      'book recommendations',
      'best books',
      'book insights',
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
