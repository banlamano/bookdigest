'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginGateProps {
  bookTitle: string;
}

export default function LoginGate({ bookTitle }: LoginGateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
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
            Sign In to Read
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            "{bookTitle}"
          </p>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Create a free account to access this book summary and 2 more this month!
          </p>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Free Account Includes:
            </h3>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">3 book summaries per month</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Key insights & action items</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Bookmark your favorite books</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Track your reading progress</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href={`/register?redirect=/books/${bookTitle}`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-lg"
            >
              Create Free Account
            </Link>
            <Link
              href={`/login?redirect=/books/${bookTitle}`}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-lg"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            No credit card required • Cancel anytime
          </p>

          {/* Premium Upgrade Hint */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Want unlimited access?
            </p>
            <Link
              href="/pricing"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View Premium Plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
