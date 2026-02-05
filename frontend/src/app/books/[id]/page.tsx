'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Headphones, Heart, Star, Play, Pause, Volume2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AudioPlayer } from '@/components/books/AudioPlayer';
import { EnhancedAudioPlayer } from '@/components/books/EnhancedAudioPlayer';
import { BookmarkButton } from '@/components/books/BookmarkButton';
import { ReadingProgressTracker } from '@/components/books/ReadingProgressTracker';
import EnhancedBookContent from '@/components/books/EnhancedBookContent';
import Link from 'next/link';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['book', params.id],
    queryFn: () => booksAPI.getById(params.id as string),
  });

  const book = data?.data?.data?.book;

  // Track book views with Google Analytics
  useEffect(() => {
    if (book) {
      import('@/lib/analytics').then(({ trackBookView }) => {
        trackBookView(book.id, book.title);
      });
    }
  }, [book]);
  const requiresPremium = data?.data?.data?.requiresPremium;

  const favoriteMutation = useMutation({
    mutationFn: () => booksAPI.toggleFavorite(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', params.id] });
      toast.success('Updated favorites');
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      router.push('/login');
      return;
    }
    favoriteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book not found</h1>
          <Link href="/library" className="btn-primary">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <ReadingProgressTracker bookId={params.id as string} bookTitle={book?.title || ''} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="md:col-span-1">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={book.coverImage || '/placeholder-book.jpg'}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2VmZjZmZiIvPjwvc3ZnPg=="
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-book.jpg';
                  }}
                />
                {book.isPremium && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-premium">Premium</span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="md:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                    style={{
                      backgroundColor: book.category.color || '#e0f2fe',
                      color: '#0369a1',
                    }}
                  >
                    {book.category.name}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{book.author}</p>
                </div>
                <BookmarkButton bookId={book.id} />
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-900 dark:text-white font-medium">
                    {book.rating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">({book.ratingsCount})</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{book.readingTime} min read</span>
                </div>
                {book.audioUrl && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Headphones className="w-5 h-5 mr-1" />
                    <span>Audio available</span>
                  </div>
                )}
              </div>

              {requiresPremium ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🔒 Premium Content
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Upgrade to Premium to access the full summary and audio narration.
                  </p>
                  <Link href="/pricing" className="btn-primary inline-block">
                    Upgrade to Premium
                  </Link>
                </div>
              ) : (
                <>
                  {/* Audio Player - Always show for free books */}
                  <EnhancedAudioPlayer 
                    bookTitle={book.title}
                    bookSummary={book.summary}
                    bookId={book.id}
                  />
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={() => {
                        const summarySection = document.getElementById('book-summary');
                        summarySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="btn-primary flex-1"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Reading
                    </button>
                    {book.amazonLink && (
                      <a
                        href={book.amazonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex-1 text-center"
                      >
                        Buy Full Book
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        {!requiresPremium && (
          <motion.div
            id="book-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <EnhancedBookContent
              summary={book.summary}
              keyInsights={book.keyInsights}
              chapters={book.chapters}
              quotes={book.quotes}
              actionItems={book.actionItems}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
