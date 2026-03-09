'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Brain, Zap, Users, DollarSign, Award, Heart } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

const iconMap: { [key: string]: any } = {
  briefcase: BookOpen,
  heart: Heart,
  brain: Brain,
  zap: Zap,
  users: Users,
  'dollar-sign': DollarSign,
  book: Award,
  'heart-pulse': Heart,
};

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });

  const categories = data?.data?.data?.categories || [];

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
            {t('categories.browseByCategory')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('categories.exploreSubtitle')}
          </p>
        </motion.div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-8 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category: any, index: number) => {
              const Icon = iconMap[category.icon || 'book'] || BookOpen;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="card p-8 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: category.color || '#0ea5e9' }}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {category.description || `${t('categories.explore')} ${category.name.toLowerCase()}`}
                      </p>
                      <div className="mt-4 text-sm text-primary-600 font-medium">
                        {t('categories.viewBooks')}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {categories.length}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('categories.categories')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('categories.bookSummaries')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">5–10min</div>
              <div className="text-gray-600 dark:text-gray-400">{t('categories.avgReadingTime')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
