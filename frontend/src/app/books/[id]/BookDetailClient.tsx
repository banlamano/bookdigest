'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { OptimizedBookCover } from '@/components/books/OptimizedBookCover';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Clock, Headphones, Star, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EnhancedAudioPlayer } from '@/components/books/EnhancedAudioPlayer';
import { BookmarkButton } from '@/components/books/BookmarkButton';
import { ReadingProgressTracker } from '@/components/books/ReadingProgressTracker';
import EnhancedBookContent from '@/components/books/EnhancedBookContent';
import { BuyOnAmazonButton } from '@/components/books/BuyOnAmazonButton';
import { BookStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import SocialShareButtons from '@/components/books/SocialShareButtons';
import FreemiumStatus from '@/components/freemium/FreemiumStatus';
import PremiumFeaturePrompt from '@/components/freemium/PremiumFeaturePrompt';
import LoginGate from '@/components/freemium/LoginGate';

interface BookDetailClientProps {
  bookId: string;
  initialBook: any;
  breadcrumbItems: Array<{ name: string; url: string }>;
}

// Loading component to avoid duplication
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

export default function BookDetailClient({ bookId, initialBook, breadcrumbItems }: BookDetailClientProps) {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks!
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch fresh data (client-side). We always do a public fetch so demo links can work for logged-out users.
  // Authenticated users still send token via interceptor.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['book', bookId, isAuthenticated],
    queryFn: () => booksAPI.getById(bookId),
    enabled: isMounted && isHydrated, // Fetch after hydration regardless of auth
    // Avoid long "Loading..." loops when user hits freemium limit (403)
    retry: (failureCount, err: any) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });

  const book = data?.data?.data?.book || initialBook;
  const freemiumStatus = data?.data?.data?.freemiumStatus;
  const requiresPremium = data?.data?.data?.requiresPremium;
  const isPublicDemo = data?.data?.data?.isPublicDemo === true;

  // Track book views with Google Analytics - MUST be before any return statements
  useEffect(() => {
    if (book) {
      import('@/lib/analytics').then(({ trackBookView }) => {
        trackBookView(book.id, book.title);
      });
    }
  }, [book]);

  // Favorite mutation - MUST be before any return statements
  const favoriteMutation = useMutation({
    mutationFn: () => booksAPI.toggleFavorite(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
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

  // NOW we can do conditional rendering - all hooks are already called
  if (!isMounted || !isHydrated) {
    return <LoadingSpinner message="Loading..." />;
  }
  
  // Show loading while fetching data
  if (isLoading) {
    return <LoadingSpinner message="Loading book details..." />;
  }

  // Check authentication (after hydration is complete). Allow public demo books without login.
  if (!isAuthenticated && !isPublicDemo) {
    return <LoginGate bookTitle={book?.title || initialBook?.title || 'this book'} />;
  }

  // Handle freemium limit reached (403) gracefully
  if (isError) {
    const status = (error as any)?.response?.status;
    const message = (error as any)?.response?.data?.message || (error as any)?.message;

    if (status === 403) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <PremiumFeaturePrompt
              feature="Unlimited Access"
              description={
                message ||
                "You've reached your free monthly limit. Upgrade to Premium for unlimited reading, key insights, and audio narration."
              }
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message || 'Please try again.'}</p>
          <Link href="/library" className="btn-primary">Back to Library</Link>
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
      {/* Structured Data for SEO */}
      <BookStructuredData book={book} />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      {isAuthenticated && (
        <ReadingProgressTracker bookId={bookId} bookTitle={book?.title || ''} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Library navigation */}
        <Link
          href="/library"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Link>
        
        {/* Freemium Status Banner */}
        {freemiumStatus && (
          <FreemiumStatus
            isPremium={freemiumStatus.isPremium || false}
            booksRemaining={freemiumStatus.booksRemaining}
            booksRead={freemiumStatus.booksRead}
            limit={freemiumStatus.limit}
          />
        )}
        
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
                <OptimizedBookCover
                  src={book.coverImage}
                  title={book.title}
                  author={book.author}
                  priority
                />
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
                      backgroundColor: book.category?.color || '#e0f2fe',
                      color: '#0369a1',
                    }}
                  >
                    {book.category?.name}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{book.author}</p>
                </div>
                {isAuthenticated && <BookmarkButton bookId={book.id} />}
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-900 dark:text-white font-medium">
                    {book.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">({book.ratingsCount || 0})</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>Quick read</span>
                </div>
                {book.audioUrl && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Headphones className="w-5 h-5 mr-1" />
                    <span>Audio {freemiumStatus?.isPremium ? 'available' : '(Premium)'}</span>
                  </div>
                )}
              </div>

              {/* Buy on Amazon Button */}
              <div className="mb-6">
                <BuyOnAmazonButton
                  amazonLinkUS={book.amazonLinkUS}
                  amazonLinkUK={book.amazonLinkUK}
                  amazonLinkDE={book.amazonLinkDE}
                  amazonLinkES={book.amazonLinkES}
                  amazonLinkFR={book.amazonLinkFR}
                  amazonLinkIT={book.amazonLinkIT}
                  amazonLink={book.amazonLink}
                  bookTitle={book.title}
                  bookAuthor={book.author}
                  isbn={book.isbn}
                />
              </div>

              {/* Audio Player - Always show if available, but gate for free users */}
              {book.audioUrl && book.summary && (
                <div className="mb-6">
                  {freemiumStatus?.isPremium ? (
                    <EnhancedAudioPlayer 
                      bookTitle={book.title}
                      bookSummary={book.summary}
                      bookId={book.id}
                    />
                  ) : (
                    <div className="relative">
                      {/* Show disabled audio player preview */}
                      <div className="opacity-50 pointer-events-none">
                        <EnhancedAudioPlayer 
                          bookTitle={book.title}
                          bookSummary={book.summary}
                          bookId={book.id}
                        />
                      </div>
                      {/* Premium overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center px-4">
                          <Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                          <h3 className="text-lg font-bold text-white mb-1">Premium Feature</h3>
                          <p className="text-gray-200 text-sm mb-3">
                            Listen with AI narration
                          </p>
                          <Link 
                            href="/pricing" 
                            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg text-sm"
                          >
                            Upgrade
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 mt-6 items-stretch">
                <button 
                  onClick={() => {
                    const summarySection = document.getElementById('book-summary');
                    summarySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="btn-primary flex-1 h-12 inline-flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Reading
                </button>
                {book.amazonLink && (
                  <a
                    href={book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex-1 h-12 inline-flex items-center justify-center text-center"
                  >
                    Buy Full Book
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs - Show only if we have summary data */}
        {book.summary && (
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
          
            {/* Social Share Buttons */}
            <SocialShareButtons 
              bookTitle={book.title}
              bookAuthor={book.author}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
