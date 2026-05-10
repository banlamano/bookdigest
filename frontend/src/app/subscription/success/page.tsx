'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, BookOpen, Headphones, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/library');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="card p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            🎉 Welcome to Premium!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8"
          >
            Your subscription is now active. Get ready to unlock unlimited learning!
          </motion.p>

          {/* Features Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✨ What You've Unlocked:
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Unlimited Books</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access all 900+ summaries
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Headphones className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Full Audio</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI-narrated summaries
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Download className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Offline Access</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download for later
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to library in <span className="font-bold text-primary-600">{countdown}</span> seconds...
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library" className="btn-primary inline-flex items-center justify-center">
                Browse Library
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/dashboard" className="btn-outline inline-flex items-center justify-center">
                Go to Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Session Info (for debugging) */}
          {sessionId && (
            <p className="mt-8 text-xs text-gray-500 dark:text-gray-600">
              Session ID: {sessionId}
            </p>
          )}
        </div>

        {/* Receipt Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
        >
          📧 A receipt has been sent to your email. You can manage your subscription anytime from your{' '}
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 underline">
            dashboard
          </Link>
          .
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function SubscriptionSuccessPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
