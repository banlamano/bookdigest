'use client';

import { BookOpen, Headphones, Smartphone, Globe, TrendingUp, Award } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export function Features() {
  const { t } = useLanguage();
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t('featuresSection.expertSummaries'),
      description: t('featuresSection.expertDesc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: t('featuresSection.audioExperience'),
      description: t('featuresSection.audioDesc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: t('featuresSection.multiPlatform'),
      description: t('featuresSection.multiDesc'),
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('featuresSection.multipleLanguages'),
      description: t('featuresSection.langDesc'),
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('featuresSection.trackProgress'),
      description: t('featuresSection.trackDesc'),
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: t('featuresSection.personalized'),
      description: t('featuresSection.personalDesc'),
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('featuresSection.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('featuresSection.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
