'use client';

import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { BookOpen, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function FreemiumStatus() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['freemium-status'],
    queryFn: () => userAPI.getFreemiumStatus(),
    // Refetch every 5 minutes to keep status fresh
    refetchInterval: 5 * 60 * 1000,
  });

  const status = data?.data?.data;

  if (isLoading || !status) {
    return null;
  }

  const { limit, used, remaining, isPremium } = status;

  // CRITICAL FIX: Don't show for premium users
  // This prevents showing "Free Trial" to paid users
  if (isPremium) {
    return null;
  }

  // Also don't show if limit is -1 (unlimited)
  if (limit === -1) {
    return null;
  }

  const percentage = (used / limit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {t('freemium.freeTierUsage')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('freemium.remainingText').replace('{remaining}', remaining.toString()).replace('{limit}', limit.toString())}
          </p>
        </div>
        <BookOpen className="w-8 h-8 text-orange-500" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${percentage >= 100
                ? 'bg-red-500'
                : percentage >= 66
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{t('freemium.usedTotal').replace('{used}', used.toString()).split('•')[0].trim()}</span>
          <span>{t('freemium.usedTotal').replace('{limit}', limit.toString()).split('•')[1].trim()}</span>
        </div>
      </div>

      {/* Warning or CTA */}
      {remaining === 0 ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            {t('freemium.limitReached')}
          </p>
          <Link href="/pricing" className="btn-primary w-full text-center block">
            <Crown className="w-4 h-4 mr-2 inline" />
            {t('freemium.upgradeToPremium')}
          </Link>
        </div>
      ) : remaining === 1 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            {t('freemium.oneLeft')}
          </p>
          <Link href="/pricing" className="btn-outline w-full text-center block text-yellow-700 border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
            {t('freemium.viewPremiumPlans')}
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {t('freemium.wantUnlimited')}
          </p>
          <Link href="/pricing" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center">
            {t('freemium.seePremiumBenefits')}
            <TrendingUp className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
