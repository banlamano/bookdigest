'use client';

import { useQuery } from '@tanstack/react-query';
import { userAPI, booksAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, Clock, TrendingUp, Award, Heart } from 'lucide-react';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import FreemiumStatus from '@/components/dashboard/FreemiumStatus';
import { BookCard } from '@/components/books/BookCard';
import { useLanguage } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration to complete before checking auth
    if (!isHydrated) return;

    // After hydration, check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userAPI.getStats(),
    enabled: isAuthenticated && isHydrated,
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => booksAPI.getFavorites(),
    enabled: isAuthenticated && isHydrated,
  });

  const stats = statsData?.data?.data?.stats;
  const favorites = favoritesData?.data?.data?.favorites || [];

  // Show loading while hydrating or redirecting
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dashboard.welcome').replace('{name}', user?.firstName || t('dashboard.reader'))}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.continueJourney')}
          </p>
        </div>

        {/* Subscription Card & Freemium Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SubscriptionCard />
          <FreemiumStatus />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label={t('dashboard.booksRead')}
            value={stats?.booksRead || 0}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label={t('dashboard.readingTime')}
            value={`${Math.floor((stats?.totalReadingTime || 0) / 60)}${t('dashboard.hours')}`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label={t('dashboard.currentStreak')}
            value={`${stats?.currentStreak || 0} ${t('dashboard.days')}`}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label={t('dashboard.achievements')}
            value={stats?.achievements || 0}
            color="from-green-500 to-teal-500"
          />
        </div>

        {/* Favorites */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.favorites')}
            </h2>
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.slice(0, 4).map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="card p-6">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
