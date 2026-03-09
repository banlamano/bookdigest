'use client';

import { useQuery } from '@tanstack/react-query';
import { booksAPI } from '@/lib/api';
import { BookCard } from '@/components/books/BookCard';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLanguage } from '@/components/LanguageProvider';

function getLangFromURL(): string {
  if (typeof window === 'undefined') return 'en';
  const params = new URLSearchParams(window.location.search);
  return params.get('lang') || 'en';
}

function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  return getLangFromURL();
}

export function FeaturedBooks() {
  const { t } = useLanguage();
  const [language, setLanguage] = useState(getInitialLanguage());
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getLangFromURL();
      setLanguage(newLang);
      setKey(k => k + 1);
    };
    
    setLanguage(getLangFromURL());
    window.addEventListener('popstate', handleLanguageChange);
    
    return () => window.removeEventListener('popstate', handleLanguageChange);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['featured-books', key],
    queryFn: () => booksAPI.getAll({ limit: 6 }),
    staleTime: 0,
  });

  const books = data?.data?.data?.books || [];

  // Preload first 6 book cover images for instant display
  useEffect(() => {
    if (books.length > 0) {
      books.slice(0, 6).forEach((book: any) => {
        if (book.coverImage) {
          const img = new Image();
          img.src = book.coverImage;
        }
      });
    }
  }, [books]);

  return (
    <ErrorBoundary>
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'de' ? 'Empfohlene Zusammenfassungen' : 'Featured Summaries'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'de' ? 'Starte mit unseren beliebtesten Buchzusammenfassungen' : 'Start with our most popular book summaries'}
              </p>
            </div>
            <Link
              href="/library"
              className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              {language === 'de' ? 'Alle anzeigen' : 'View All'} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
              : books.slice(0, 8).map((book: any) => <BookCard key={book.id} book={book} />)}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/library" className="btn-outline">
              {language === 'de' ? 'Alle Bücher' : 'View All Books'}
            </Link>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
