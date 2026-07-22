import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import CategoryBooksClient from './CategoryBooksClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// Fetch category data on server.
// The language must match what the client will render, otherwise the client
// discards these books and the server HTML ships without any book links —
// which left Googlebot with no crawl path to the book pages at all.
async function getCategoryBooks(slug: string, language: string, page = 1) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(
      `${API_URL}/api/categories/${slug}/books?page=${page}&limit=12&language=${language}`,
      {
        cache: 'no-store',
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/** ?page=N, clamped to a sane positive integer. */
function parsePage(searchParams?: { page?: string }) {
  const n = parseInt(searchParams?.page ?? '1', 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}): Promise<Metadata> {
  const language = cookies().get('language')?.value === 'de' ? 'de' : 'en';
  const page = parsePage(searchParams);
  const data = await getCategoryBooks(params.slug, language, page);
  const category = data?.category;

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  // Paginated pages need their own title and self-referencing canonical,
  // otherwise Google treats them as duplicates of page 1 and drops them —
  // which would defeat using them to discover the deeper books.
  const pageSuffix = page > 1 ? ` - Page ${page}` : '';
  const canonicalUrl =
    page > 1
      ? `https://book-digest.com/categories/${params.slug}?page=${page}`
      : `https://book-digest.com/categories/${params.slug}`;

  const categoryTitle = `${category.name} Books - AI Summaries & Key Insights${pageSuffix}`;
  const categoryDescription = category.description ||
    `Explore ${data?.books?.length || 'our collection of'} AI-generated summaries of the best ${category.name.toLowerCase()} books. Learn from top authors and get key insights in 15 minutes. Business book summaries, self-help guides, and more.`;

  return {
    title: categoryTitle,
    description: categoryDescription,
    keywords: [
      category.name,
      `${category.name} books`,
      `${category.name} book summaries`,
      `best ${category.name} books`,
      'book recommendations',
      'AI book summaries',
      'book insights',
      '15 minute reads',
      'book notes',
    ],
    openGraph: {
      title: categoryTitle,
      description: categoryDescription,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: categoryTitle,
      description: categoryDescription,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CategoryBooksPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const language = cookies().get('language')?.value === 'de' ? 'de' : 'en';
  const page = parsePage(searchParams);
  const data = await getCategoryBooks(params.slug, language, page);

  if (!data || !data.category) {
    notFound();
  }

  const { category, books, pagination } = data;

  // ?page= beyond the last page would otherwise return 200 with an empty grid:
  // unlimited thin pages for a crawler to wander into. 404 them instead.
  if (page > 1 && pagination?.pages && page > pagination.pages) {
    notFound();
  }

  // Breadcrumb data for structured data
  const breadcrumbItems = [
    { name: 'Home', url: 'https://book-digest.com' },
    { name: 'Categories', url: 'https://book-digest.com/categories' },
    { name: category.name, url: `https://book-digest.com/categories/${params.slug}` },
  ];

  return (
    <CategoryBooksClient
      slug={params.slug}
      initialCategory={category}
      initialBooks={books}
      initialPagination={pagination}
      initialLanguage={language}
      initialPage={page}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
