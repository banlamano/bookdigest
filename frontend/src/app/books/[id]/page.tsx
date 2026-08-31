import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';
import BookDetailClient from './BookDetailClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// UUID regex for detecting legacy ID-based URLs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Fetch book data on server (public data only for metadata)
async function getBook(idOrSlug: string, language: string = 'en') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const url = new URL(`${API_URL}/api/books/${idOrSlug}`);
    url.searchParams.append('language', language);

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If 401 (auth required), return a minimal book object for the client to handle
    if (res.status === 401) {
      return {
        id: idOrSlug,
        title: 'Book Summary',
        author: 'Unknown',
        requiresAuth: true,
        _alternateSlug: null,
      };
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const book = data?.data?.book;
    if (!book) return null;
    // Attach alternate-language slug for hreflang tags in metadata
    book._alternateSlug = data?.data?.alternateSlug || null;
    return book;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

/**
 * Resolve the param to the real book identifier.
 * Old URLs like `atomic-habits-summary-<uuid>` embed the UUID after "-summary-" or "-zusammenfassung-".
 * New URLs are clean slugs like `atomic-habits-james-clear`.
 * Raw UUIDs are also supported for backwards compatibility.
 */
function resolveParam(param: string): { identifier: string; isLegacy: boolean } {
  // Check for legacy format: <title>-summary-<uuid> or <title>-zusammenfassung-<uuid>
  const parts = param.split(/-summary-|-zusammenfassung-/);
  if (parts.length > 1) {
    const possibleId = parts[parts.length - 1];
    if (UUID_REGEX.test(possibleId)) {
      return { identifier: possibleId, isLegacy: true };
    }
  }

  // Check for raw UUID
  if (UUID_REGEX.test(param)) {
    return { identifier: param, isLegacy: true };
  }

  // It's a slug — pass it directly to the API (backend resolves slug → book)
  return { identifier: param, isLegacy: false };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cookieStore = cookies();
  const headerList = headers();
  const cookieLang = cookieStore.get('language')?.value;
  const browserLang = headerList.get('accept-language')?.split(',')[0].split('-')[0];
  const language = cookieLang || (browserLang === 'de' ? 'de' : 'en');

  const { identifier } = resolveParam(params.id);
  const book = await getBook(identifier, language);

  if (!book) {
    return {
      title: 'Book Summary - BookDigest',
      description: 'Discover book summaries, key insights, and actionable takeaways.',
    };
  }

  const isDe = book.language === 'de';
  // Front-load the exact query users search for ("<book> summary"/"<book> zusammenfassung").
  // Google weights the start of the <title> most, so the primary keyword leads.
  const bookTitle = isDe
    ? `${book.title} Zusammenfassung — ${book.author} | Kernideen & Analyse`
    : `${book.title} Summary — ${book.author} | Key Insights & Analysis`;
  // Keyword-rich meta description that leads with intent and weaves in the synonym
  // cluster people actually search (plot / synopsis / themes / takeaways).
  const bookDescription = isDe
    ? `Kostenlose Zusammenfassung von ${book.title} von ${book.author}: Handlung, zentrale Themen, Charaktere und Kernaussagen — Synopsis und Analyse in 15 Minuten.`
    : `Free summary of ${book.title} by ${book.author}: plot overview, key themes, characters, and main takeaways — synopsis and analysis in a 15-minute read.`;

  const canonicalSlug = book.slug || params.id;

  return {
    title: bookTitle,
    description: bookDescription,
    keywords: [
      book.title,
      `${book.title} ${isDe ? 'zusammenfassung' : 'summary'}`,
      `${book.title} ${isDe ? 'inhaltsangabe' : 'synopsis'}`,
      `${book.title} ${isDe ? 'handlung' : 'plot summary'}`,
      `${book.title} ${isDe ? 'analyse' : 'analysis'}`,
      `${book.title} ${isDe ? 'themen' : 'themes'}`,
      book.author,
      `${book.author} books`,
      book.category?.name || '',
      `${book.category?.name || ''} books`,
      isDe ? 'buchzusammenfassung' : 'book summary',
      'book notes',
      'key insights',
      'book takeaways',
      '15 minute read',
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
      canonical: `https://book-digest.com/books/${canonicalSlug}`,
      // hreflang tags — tell search engines which language version to serve in each market.
      // Falls back gracefully when no alternate exists (only one language version on file).
      languages: book._alternateSlug
        ? {
            [book.language === 'de' ? 'en' : 'de']: `https://book-digest.com/books/${book._alternateSlug}`,
            [book.language]: `https://book-digest.com/books/${canonicalSlug}`,
            'x-default': `https://book-digest.com/books/${book.language === 'en' ? canonicalSlug : book._alternateSlug}`,
          }
        : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const headerList = headers();
  const cookieLang = cookieStore.get('language')?.value;
  const browserLang = headerList.get('accept-language')?.split(',')[0].split('-')[0];
  const language = cookieLang || (browserLang === 'de' ? 'de' : 'en');

  const { identifier, isLegacy } = resolveParam(params.id);
  const book = await getBook(identifier, language);

  // If the URL used a legacy format (UUID or title-summary-uuid) and the book has a slug,
  // do a 301 permanent redirect to the clean slug URL for SEO
  if (isLegacy && book?.slug) {
    permanentRedirect(`/books/${book.slug}`);
  }

  if (!book) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://book-digest.com' },
    { name: 'Library', url: 'https://book-digest.com/library' },
    { name: book?.title || 'Book Details', url: `https://book-digest.com/books/${book?.slug || params.id}` },
  ];

  return (
    <BookDetailClient bookId={book.id} initialBook={book} breadcrumbItems={breadcrumbItems} />
  );
}
