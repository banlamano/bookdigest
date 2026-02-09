import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryBooksClient from './CategoryBooksClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

// Fetch category data on server
async function getCategoryBooks(slug: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(`${API_URL}/api/categories/${slug}/books?page=1&limit=12`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    
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

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCategoryBooks(params.slug);
  const category = data?.category;

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryTitle = `${category.name} Books - AI Summaries & Key Insights`;
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
      url: `https://book-digest.com/categories/${params.slug}`,
    },
    twitter: {
      card: 'summary',
      title: categoryTitle,
      description: categoryDescription,
    },
    alternates: {
      canonical: `https://book-digest.com/categories/${params.slug}`,
    },
  };
}

export default async function CategoryBooksPage({ params }: { params: { slug: string } }) {
  const data = await getCategoryBooks(params.slug);

  if (!data || !data.category) {
    notFound();
  }

  const { category, books, pagination } = data;

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
      breadcrumbItems={breadcrumbItems}
    />
  );
}
