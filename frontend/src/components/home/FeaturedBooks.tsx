'use client';

import { useQuery } from '@tanstack/react-query';
import { booksAPI } from '@/lib/api';
import { BookCard } from '@/components/books/BookCard';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedBooks() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-books'],
    queryFn: () => booksAPI.getFeatured(),
  });

  const books = data?.data?.data?.books || [];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Summaries
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start with our most popular book summaries
            </p>
          </div>
          <Link
            href="/library"
            className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
            : books.slice(0, 8).map((book: any) => <BookCard key={book.id} book={book} />)}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/library" className="btn-outline">
            View All Books
          </Link>
        </div>
      </div>
    </section>
  );
}
