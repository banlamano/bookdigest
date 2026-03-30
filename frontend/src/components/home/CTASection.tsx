'use client';

import Link from 'next/link';
import { ArrowRight, Check, BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { paymentAPI } from '@/lib/api';

export function CTASection() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuthStore();

  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => paymentAPI.getSubscriptionStatus(),
    enabled: isAuthenticated,
  });

  const subscriptionType = subscriptionData?.data?.data?.subscriptionType || 'FREE';
  const subscriptionEnd = subscriptionData?.data?.data?.subscriptionEnd;
  const isPremium = subscriptionType !== 'FREE' &&
    subscriptionEnd &&
    new Date(subscriptionEnd) > new Date();

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isPremium ? (
              <Link
                href="/library"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {t('nav.library')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  href={isAuthenticated ? "/pricing" : "/register"}
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  {t('cta.startTrial')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/pricing"
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  {t('cta.viewPricing')}
                </Link>
              </>
            )}
          </div>

          {!isPremium && (
            <div className="flex flex-wrap justify-center gap-6 text-primary-100">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>{t('cta.trialFeature1')}</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>{t('cta.trialFeature2')}</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>{t('cta.trialFeature3')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
