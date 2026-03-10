'use client';

import { BookOpen, Headphones, Smartphone, TrendingUp, Award, Globe } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function FeaturesPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: t('featuresPage.fifteenMinTitle'),
      description: t('featuresPage.fifteenMinDesc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: t('featuresPage.audioTitle'),
      description: t('featuresPage.audioDesc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: t('featuresPage.mobileTitle'),
      description: t('featuresPage.mobileDesc'),
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('featuresPage.progressTitle'),
      description: t('featuresPage.progressDesc'),
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t('featuresPage.qualityTitle'),
      description: t('featuresPage.qualityDesc'),
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('featuresPage.multilingualTitle'),
      description: t('featuresPage.multilingualDesc'),
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('featuresPage.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('featuresPage.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-8 hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
