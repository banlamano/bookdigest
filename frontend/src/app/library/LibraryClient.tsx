'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksAPI, categoriesAPI } from '@/lib/api';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import { Search } from 'lucide-react';
import { BookCard } from '@/components/books/BookCard';

export default function LibraryClient({ language: initialLanguage }: { language: string }) {
  const [language] = useState(initialLanguage);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books', page, selectedCategory, showPremiumOnly, language],
    queryFn: () =>
      booksAPI.getAll({
        page,
        limit: 20,
        category: selectedCategory || undefined,
        isPremium: showPremiumOnly || undefined,
      }),
  });

  const categories = categoriesData?.data?.data?.categories || [];
  const books = booksData?.data?.data?.books || [];
  const pagination = booksData?.data?.data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'de' ? 'Buchbibliothek' : 'Book Library'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'de' 
              ? `Durchsuche unsere Sammlung von ${pagination?.total || 500}+ Buchzusammenfassungen`
              : `Explore our collection of ${pagination?.total || 500}+ book summaries`}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'de' ? 'Bücher, Autoren, Themen suchen...' : 'Search books, authors, topics...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{language === 'de' ? 'Alle Kategorien' : 'All Categories'}</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'de' ? 'Nur Premium' : 'Premium only'}
              </span>
            </label>

            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              {pagination && (language === 'de' 
                ? `Zeige ${books.length} von ${pagination.total} Büchern`
                : `Showing ${books.length} of ${pagination.total} books`)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <BookCardSkeleton key={i} />)
            : books.map((book: any) => <BookCard key={book.id} book={book} />)}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {language === 'de' ? 'Zurück' : 'Previous'}
            </button>
            <div className="flex items-center px-4">
              {language === 'de' ? `Seite ${page} von ${pagination.pages}` : `Page ${page} of ${pagination.pages}`}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {language === 'de' ? 'Weiter' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
