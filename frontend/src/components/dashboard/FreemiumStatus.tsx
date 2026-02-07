'use client';

import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { BookOpen, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FreemiumStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['freemium-status'],
    queryFn: () => userAPI.getFreemiumStatus(),
  });

  const status = data?.data?.data;

  if (isLoading || !status) {
    return null;
  }

  const { limit, used, remaining, isPremium } = status;

  // Don't show for premium users
  if (isPremium) {
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
            Free Tier Usage
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {remaining} of {limit} books remaining this month
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
            className={`h-full rounded-full ${
              percentage >= 100
                ? 'bg-red-500'
                : percentage >= 66
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{used} used</span>
          <span>{limit} total</span>
        </div>
      </div>

      {/* Warning or CTA */}
      {remaining === 0 ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            ⚠️ You've reached your monthly limit. Upgrade to Premium for unlimited access!
          </p>
          <Link href="/pricing" className="btn-primary w-full text-center block">
            <Crown className="w-4 h-4 mr-2 inline" />
            Upgrade to Premium
          </Link>
        </div>
      ) : remaining === 1 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            ⚡ Only 1 book left this month! Upgrade for unlimited reading.
          </p>
          <Link href="/pricing" className="btn-outline w-full text-center block text-yellow-700 border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
            View Premium Plans
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Want unlimited access? Upgrade to Premium!
          </p>
          <Link href="/pricing" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center">
            See Premium Benefits
            <TrendingUp className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
