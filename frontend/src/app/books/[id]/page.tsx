import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// Fetch book data on server
async function getBook(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(`${API_URL}/api/books/${id}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
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

  if (!book) {
    notFound();
  }

  // Breadcrumb data for structured data
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
