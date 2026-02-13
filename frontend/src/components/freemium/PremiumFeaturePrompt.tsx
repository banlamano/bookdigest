'use client';

import Link from 'next/link';

interface PremiumFeaturePromptProps {
  feature: string;
  description?: string;
}

export default function PremiumFeaturePrompt({ feature, description }: PremiumFeaturePromptProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-8 text-center">
      <div className="mb-4">
        <span className="text-6xl">🎧</span>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {feature} is a Premium Feature
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        {description || `Upgrade to Premium to unlock ${feature.toLowerCase()} and enjoy unlimited book summaries.`}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="text-green-500">✓</span>
          <span>Unlimited book summaries</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="text-green-500">✓</span>
          <span>Audio narration for all books</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="text-green-500">✓</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/pricing"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Upgrade to Premium
        </Link>
        <Link
          href="/library"
          className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          Browse Books
        </Link>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Starting at just €9.99/month
      </p>
    </div>
  );
}
