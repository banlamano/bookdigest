'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

interface LoginGateProps {
  bookTitle: string;
}

export default function LoginGate({ bookTitle }: LoginGateProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 rounded-3xl mt-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('loginGate.signInToRead')}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            "{bookTitle}"
          </p>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t('loginGate.createFreeAccountToAccess')}
          </p>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('loginGate.freeAccountIncludes')}
            </h3>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('loginGate.feature1')}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('loginGate.feature2')}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('loginGate.feature3')}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('loginGate.feature4')}</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href={`/register?redirect=/books/${bookTitle}`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-lg"
            >
              {t('loginGate.createFreeAccount')}
            </Link>
            <Link
              href={`/login?redirect=/books/${bookTitle}`}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-lg"
            >
              {t('loginGate.signIn')}
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('loginGate.noCreditCard')}
          </p>

          {/* Premium Upgrade Hint */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('loginGate.wantUnlimited')}
            </p>
            <Link
              href="/pricing"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {t('loginGate.viewPremiumPlansLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
