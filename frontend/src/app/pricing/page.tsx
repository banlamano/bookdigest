'use client';

import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Testimonials } from '@/components/home/Testimonials';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageProvider';

export default function PricingPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Fetch subscription status
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => paymentAPI.getSubscriptionStatus(),
    enabled: isAuthenticated,
  });

  const subscriptionType = subscriptionData?.data?.data?.subscriptionType || 'FREE';
  const isPremium = subscriptionType !== 'FREE';

  // Check if a specific plan is the user's current subscription
  const isCurrentPlan = (planType: string | null) => {
    if (!planType) return false;
    if (planType === 'monthly') return subscriptionType === 'PREMIUM_MONTHLY';
    if (planType === 'yearly') return subscriptionType === 'PREMIUM_YEARLY';
    if (planType === 'team') return subscriptionType === 'TEAM';
    return false;
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly' | 'team') => {
    if (!isAuthenticated) {
      toast.error(t('pricing.loginToSubscribe'));
      router.push('/login');
      return;
    }

    setIsLoading(planType);
    try {
      const response = await paymentAPI.createCheckoutSession(planType);
      const { url } = response.data.data;
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(null);
    }
  };

  // Product Hunt launch: keep choices simple (Monthly + Yearly only)
  const plans = [
    {
      name: t('pricing.free'),
      price: '€0',
      period: t('pricing.forever'),
      description: t('pricing.perfectStart'),
      features: [
        t('pricing.summariesPerMonth'),
        t('pricing.basicFeatures'),
        t('pricing.limitedAudio'),
        t('pricing.mobileAccess'),
      ],
      cta: t('pricing.getStarted'),
      highlighted: false,
      planType: null,
    },
    {
      name: t('pricing.premiumMonthly'),
      price: '€9.99',
      period: t('pricing.perMonth'),
      description: t('pricing.seriousLearners'),
      features: [
        t('pricing.unlimited'),
        t('pricing.audioNarration'),
        t('pricing.adFree'),
        t('pricing.prioritySupport'),
        t('pricing.earlyAccess'),
      ],
      cta: t('pricing.getPremium'),
      highlighted: true,
      planType: 'monthly' as const,
    },
    {
      name: t('pricing.premiumYearly'),
      price: '€79.99',
      period: t('pricing.perYear'),
      badge: t('pricing.save33'),
      description: t('pricing.bestValue'),
      features: [
        t('pricing.everythingMonthly'),
        t('pricing.save40'),
      ],
      cta: t('pricing.getPremium'),
      highlighted: false,
      planType: 'yearly' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('pricing.choosePlan')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            {t('pricing.chooseSubtitle')}
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card p-8 relative ${plan.highlighted
                ? 'ring-2 ring-primary-600 shadow-xl scale-105'
                : ''
                }`}
            >
              {plan.badge && (
                <div className="absolute top-3 left-1/2 z-10 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan(plan.planType) ? (
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 py-3 rounded-lg font-medium">
                    {t('pricing.currentPlan')}
                  </div>
                  <a
                    href="/dashboard"
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                  >
                    {t('pricing.manageSubscription')}
                  </a>
                </div>
              ) : plan.planType ? (
                <button
                  onClick={() => handleSubscribe(plan.planType!)}
                  disabled={isLoading === plan.planType}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.highlighted
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading === plan.planType ? t('pricing.processing') : plan.cta}
                </button>
              ) : (
                <a
                  href={isAuthenticated ? '/library' : '/register'}
                  className="block w-full py-3 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-center"
                >
                  {plan.cta}
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('pricing.comparison')}
          </h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('pricing.feature')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {t('pricing.free')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600">
                      {t('pricing.premium')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.summariesMonth')}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {t('pricing.threeSummaries')}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-primary-600 dark:text-primary-400 font-semibold">
                      {t('pricing.unlimitedAccess')}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.audioNarration')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.adFree')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.keyInsights')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('pricing.limited')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.quotesHighlights')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.prioritySupport')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.earlyAccessBooks')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {t('pricing.mobileAccess')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">
                      {t('pricing.price')}
                    </td>
                    <td className="px-6 py-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
                      €0
                    </td>
                    <td className="px-6 py-4 text-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                      €9.99/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-2 border-t border-gray-200 dark:border-gray-700">
              <div className="px-6 py-6 text-center">
                <a
                  href="/register"
                  className="btn-outline inline-block"
                >
                  {t('pricing.startFree')}
                </a>
              </div>
              <div className="px-6 py-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 text-center border-l border-gray-200 dark:border-gray-700">
                {isPremium ? (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 py-3 rounded-lg font-medium">
                    {t('pricing.youArePremium')}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={isLoading === 'monthly'}
                    className="btn-primary"
                  >
                    {isLoading === 'monthly' ? t('pricing.processing') : t('pricing.getPremium')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pricing.faq')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('pricing.faqSubtitle')}
          </p>
          <a
            href="mailto:support@bookdigest.com"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('pricing.contactSupport')}
          </a>
        </div>
      </div>
    </div>
  );
}
