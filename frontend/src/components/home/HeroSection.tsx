'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Headphones, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

interface HeroSectionProps {
  language?: string;
}

export function HeroSection({ language: initialLanguage }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('hero.stats.books')}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('hero.title')}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/register" className="btn-primary text-lg px-8 py-3">
                {t('hero.cta')}
              </Link>
              <Link href="/library" className="btn-outline text-lg px-8 py-3">
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('hero.stats.booksValue')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('hero.stats.books')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('hero.stats.readValue')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('hero.stats.read')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('hero.stats.ratingValue')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('hero.stats.rating')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title={t('features.quick.title')}
                description={t('features.quick.desc')}
                gradient="from-blue-500 to-cyan-500"
                delay={0.3}
              />
              <FeatureCard
                icon={<Headphones className="w-8 h-8" />}
                title={t('features.audio.title')}
                description={t('features.audio.desc')}
                gradient="from-purple-500 to-pink-500"
                delay={0.4}
              />
              <FeatureCard
                icon={<Clock className="w-8 h-8" />}
                title={t('features.free.title')}
                description={t('features.free.desc')}
                gradient="from-orange-500 to-red-500"
                delay={0.5}
              />
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8" />}
                title={t('features.ai.title')}
                description={t('features.ai.desc')}
                gradient="from-green-500 to-teal-500"
                delay={0.6}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6 hover:shadow-lg transition-shadow"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}
