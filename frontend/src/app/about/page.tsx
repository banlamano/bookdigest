'use client';

import { BookOpen, Users, Target, Award } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.missionTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('about.missionDesc1')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('about.missionDesc2')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <BookOpen className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">900+</div>
            <div className="text-gray-600 dark:text-gray-400">{t('about.statsSummaries')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">{t('about.statsUsers')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4.8★</div>
            <div className="text-gray-600 dark:text-gray-400">{t('about.statsRating')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">15min</div>
            <div className="text-gray-600 dark:text-gray-400">{t('about.statsTime')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
