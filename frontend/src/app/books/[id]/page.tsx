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
import Link from 'next/link';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'summary' | 'insights' | 'quotes' | 'chapters' | 'actions'>('summary');

  const { data, isLoading } = useQuery({
    queryKey: ['book', params.id],
    queryFn: () => booksAPI.getById(params.id as string),
  });

  const book = data?.data?.data?.book;
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
                  unoptimized
                  priority
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
          <>
            <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Key Insights
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'quotes'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Quotes
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'chapters'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Chapters
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'actions'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Action Items
              </button>
            </div>

            <motion.div
              id="book-summary"
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8"
            >
              {activeTab === 'summary' && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Book Summary</h2>
                  <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {book.summary}
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Key Insights</h2>
                  <div className="space-y-4">
                    {book.keyInsights?.split('\n').filter((line: string) => line.trim()).map((insight: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-5 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 flex-1 pt-1">{insight.replace(/^[•\-]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'quotes' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Inspiring Quotes</h2>
                  <div className="space-y-8">
                    {book.quotes?.split('\n\n').filter((line: string) => line.trim()).map((quote: string, index: number) => (
                      <blockquote
                        key={index}
                        className="relative border-l-4 border-primary-600 pl-8 py-4 italic text-xl text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg"
                      >
                        <span className="absolute -left-3 top-0 text-6xl text-primary-600 opacity-20">"</span>
                        {quote.replace(/^[""]|[""]$/g, '')}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chapters' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Chapter Breakdown</h2>
                  <div className="space-y-3">
                    {book.chapters?.split(',').map((chapter: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{chapter.trim()}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Action Items</h2>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 mb-6">
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      🎯 Apply what you've learned! Here are actionable steps to implement the insights from this book:
                    </p>
                  </div>
                  <div className="space-y-4">
                    {book.actionItems?.split('\n').filter((line: string) => line.trim()).map((action: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-5 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <p className="text-gray-800 dark:text-gray-200 flex-1">{action.replace(/^[•\-]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
