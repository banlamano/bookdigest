'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

interface FreemiumStatusProps {
  isPremium: boolean;
  booksRemaining?: number;
  booksRead?: number;
  limit?: number;
}

export default function FreemiumStatus({ isPremium, booksRemaining, booksRead, limit }: FreemiumStatusProps) {
  const { t } = useLanguage();

  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">{t('freemium.premiumMember')}</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{t('freemium.unlimitedAccess')}</p>
          </div>
        </div>
      </div>
    );
  }

  const percentageUsed = limit ? (booksRead! / limit) * 100 : 0;
  const isLimitReached = booksRemaining === 0;

  return (
    <div className={`border rounded-lg p-4 mb-6 ${isLimitReached
      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isLimitReached ? '🚫' : '📚'}</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {isLimitReached ? t('freemium.monthlyLimitReached') : t('freemium.freePlan')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('freemium.booksReadText').replace('{read}', booksRead?.toString() || '0').replace('{limit}', limit?.toString() || '0')}
            </p>
          </div>
        </div>

        {!isLimitReached && (
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{booksRemaining}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('freemium.remaining')}</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-blue-500'
            }`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      {isLimitReached ? (
        <div className="text-center">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {t('freemium.upgradeToKeepReading')}
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            {t('freemium.upgradeToPremium')}
          </Link>
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('freemium.upgradeForUnlimited')}
        </p>
      )}
    </div>
  );
}
