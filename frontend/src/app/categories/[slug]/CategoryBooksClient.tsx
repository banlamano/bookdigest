'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { BreadcrumbStructuredData } from '@/components/StructuredData';
import { BookCard } from '@/components/books/BookCard';
import { useLanguage } from '@/components/LanguageProvider';
import { useEffect } from 'react';

interface CategoryBooksClientProps {
  slug: string;
  initialCategory: any;
  initialBooks: any[];
  initialPagination: any;
  /** Language the server fetched initialBooks in — the category object carries no language field. */
  initialLanguage: string;
  /** Page from ?page=N. Pagination lives in the URL so each page is its own crawlable document. */
  initialPage: number;
  breadcrumbItems: Array<{ name: string; url: string }>;
}

export default function CategoryBooksClient({
  slug,
  initialCategory,
  initialBooks,
  initialPagination,
  initialLanguage,
  initialPage,
  breadcrumbItems,
}: CategoryBooksClientProps) {
  const { t, language } = useLanguage();
  const page = initialPage;
  const [isMounted, setIsMounted] = useState(false);

  const pageHref = (n: number) => (n <= 1 ? `/categories/${slug}` : `/categories/${slug}?page=${n}`);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['category-books', slug, page, language],
    queryFn: () => categoriesAPI.getBooks(slug, { page, limit: 12, language }),
    enabled: isMounted && !!language, 
  });

  // Prioritize live data from useQuery, then fall back to initialData ONLY if languages match.
  // Compare against initialLanguage: the category object has no `language` field, so the old
  // `initialCategory?.language === language` check was always false. That made the server render
  // an empty book grid, so the shipped HTML contained zero /books/ links and Googlebot had no
  // way to discover the ~900 book pages.
  const serverDataMatchesLanguage = initialLanguage === language;
  const category = data?.data?.data?.category || initialCategory;
  const books = data?.data?.data?.books || (serverDataMatchesLanguage ? initialBooks : []);
  const pagination = data?.data?.data?.pagination || (serverDataMatchesLanguage ? initialPagination : null);

  // Only take over the whole page with skeletons when there is genuinely nothing
  // to show. The server already delivered this page's books, and blanking them
  // during SSR would hide pages 2+ from crawlers just like page 1 was hidden.
  if (isLoading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      {/* Structured Data for SEO */}
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('categoryDetail.backToCategories')}
          </Link>

          <div className="flex items-center space-x-4 mb-4">
            {category?.color && (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <span className="text-2xl text-white">📚</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {category?.name || t('nav.categories')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {books.length} {books.length !== 1 ? t('categoryDetail.booksInCategoryPlural') : t('categoryDetail.booksInCategory')}
              </p>
            </div>
          </div>

          {/* Category description — unique per category, gives Google something
              substantial to index and search-rank for category-related queries. */}
          {category?.description && (
            <div className="prose dark:prose-invert max-w-3xl text-gray-700 dark:text-gray-300">
              <p>{category.description}</p>
            </div>
          )}
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('categoryDetail.noBooksFound')}
            </p>
            <Link href="/library" className="btn-primary">
              {t('categoryDetail.browseAll')}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination — real <a> links (not onClick handlers) so Googlebot can
                walk every page of the category and reach all of its books. */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    rel="prev"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {t('pagination.previous')}
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed">
                    {t('pagination.previous')}
                  </span>
                )}
                <div className="flex items-center px-4">
                  {t('pagination.page')} {page} {t('pagination.of')} {pagination.pages}
                </div>
                {page < pagination.pages ? (
                  <Link
                    href={pageHref(page + 1)}
                    rel="next"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {t('pagination.next')}
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed">
                    {t('pagination.next')}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
