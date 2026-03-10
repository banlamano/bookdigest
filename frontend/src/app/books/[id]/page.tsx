import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// Fetch book data on server (public data only for metadata)
async function getBook(id: string, language: string = 'en') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const url = new URL(`${API_URL}/api/books/${id}`);
    url.searchParams.append('language', language);

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If 401 (auth required), return a minimal book object for the client to handle
    if (res.status === 401) {
      return {
        id,
        title: 'Book Summary',
        author: 'Unknown',
        requiresAuth: true
      };
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data?.book || null;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const cookieStore = cookies();
    const headerList = headers();
    const cookieLang = cookieStore.get('language')?.value;
    const browserLang = headerList.get('accept-language')?.split(',')[0].split('-')[0];
    const language = cookieLang || (browserLang === 'de' ? 'de' : 'en');

    // Fetch book data for metadata only (won't cause hydration issues)
    const book = await getBook(params.id, language);

    if (!book) {
      return {
        title: 'Book Summary - BookDigest',
        description: 'Discover book summaries, key insights, and actionable takeaways.',
      };
    }

    const bookTitle = `${book.title} by ${book.author} - Summary & Key Insights`;
    const bookDescription = book.description
      ? `${book.description.substring(0, 155)}...`
      : `Read our AI-generated summary of ${book.title} by ${book.author}. Get key insights, quotes, and action items in 15 minutes. ${book.category?.name || 'Book'} summary with practical takeaways.`;

    return {
      title: bookTitle,
      description: bookDescription,
      keywords: [
        book.title,
        `${book.title} summary`,
        `${book.title} book summary`,
        book.author,
        `${book.author} books`,
        book.category?.name || '',
        `${book.category?.name || ''} books`,
        'book summary',
        'book notes',
        'key insights',
        'book takeaways',
        '15 minute read',
        'AI book summary',
      ].filter(Boolean),
      authors: [{ name: book.author }],
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
        publishedTime: book.createdAt,
        modifiedTime: book.updatedAt,
        authors: [book.author],
        tags: [book.category?.name, 'Book Summary', 'Key Insights'].filter(Boolean),
      },
      twitter: {
        card: 'summary_large_image',
        title: bookTitle,
        description: bookDescription,
        images: book.coverImage ? [book.coverImage] : undefined,
      },
      alternates: {
        canonical: `https://book-digest.com/books/${params.id}`,
      },
    };
  }

  export default async function BookDetailPage({ params }: { params: { id: string } }) {
    // Don't fetch book data server-side to avoid hydration issues
    // Let the client component handle all data fetching with proper auth
    const breadcrumbItems = [
      { name: 'Home', url: 'https://book-digest.com' },
      { name: 'Books', url: 'https://book-digest.com/library' },
      { name: 'Category', url: 'https://book-digest.com/categories' },
      { name: 'Book Details', url: `https://book-digest.com/books/${params.id}` },
    ];

    return (
      <>
        <BookDetailClient bookId={params.id} initialBook={null} breadcrumbItems={breadcrumbItems} />
      </>
    );
  }
