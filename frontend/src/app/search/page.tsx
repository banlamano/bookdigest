'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { booksAPI } from '@/lib/api';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { BookCard } from '@/components/books/BookCard';
import { useLanguage } from '@/components/LanguageProvider';
import SearchAutocomplete from '@/components/SearchAutocomplete';

function SearchPageContent() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const initialQuery = params?.get('q') || '';
  const [page, setPage] = useState(1);

  // The autocomplete handles its own typing UX. We also keep a "results
  // for this URL ?q=" grid below — useful when users land via the
  // navbar's "See all results →" link or a shared URL.
  const debouncedQuery = initialQuery;

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, page],
    queryFn: () => booksAPI.search(debouncedQuery, { page, limit: 12 }),
    enabled: debouncedQuery.length > 0,
  });

  const books = data?.data?.data?.books || [];
  const pagination = data?.data?.data?.pagination;

  useEffect(() => {
    if (debouncedQuery && books) {
      import('@/lib/analytics').then(({ trackSearch }) => {
        trackSearch(debouncedQuery, books.length);
      });
    }
  }, [debouncedQuery, books]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('search.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('search.subtitle')}
          </p>
        </motion.div>

        {/* Search Bar (autocomplete) */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchAutocomplete variant="page" autoFocus initialQuery={initialQuery} />
        </div>

        {/* Results */}
        {!debouncedQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('search.startTyping')}
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('search.noBooksFound').replace('{query}', debouncedQuery)}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {books.length === 1
                  ? t('search.resultsCountSingle').replace('{query}', debouncedQuery)
                  : t('search.resultsCount').replace('{count}', (pagination?.total || books.length).toString()).replace('{query}', debouncedQuery)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t('pagination.previous')}
                </button>
                <div className="flex items-center px-4">
                  {t('pagination.page')} {page} {t('pagination.of')} {pagination.pages}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
