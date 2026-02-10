import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamicImport from 'next/dynamic';

// Import BookDetailClient with no SSR to prevent hydration issues
const BookDetailClient = dynamicImport(() => import('./BookDetailClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading book details...</p>
      </div>
    </div>
  ),
});

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// Fetch book data on server (public data only for metadata)
async function getBook(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(`${API_URL}/api/books/${id}`, {
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
  const book = await getBook(params.id);

  if (!book) {
    return {
      title: 'Book Not Found',
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
  const book = await getBook(params.id);

  // Only return 404 if book truly doesn't exist (not auth error)
  if (!book) {
    notFound();
  }

  // If book requires auth, client component will handle login gate
  // Still render the page with minimal data for SEO
  const breadcrumbItems = [
    { name: 'Home', url: 'https://book-digest.com' },
    { name: 'Books', url: 'https://book-digest.com/library' },
    { name: book.category?.name || 'Category', url: `https://book-digest.com/categories/${book.category?.slug || ''}` },
    { name: book.title, url: `https://book-digest.com/books/${params.id}` },
  ];

  return (
    <>
      <BookDetailClient bookId={params.id} initialBook={book} breadcrumbItems={breadcrumbItems} />
    </>
  );
}
