'use client';

import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="card p-8 md:p-12 text-center">
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-gray-600 dark:text-gray-400" />
            </div>
          </motion.div>

          {/* Cancel Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Subscription Canceled
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8"
          >
            No worries! Your payment was not processed.
          </motion.p>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8"
          >
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Changed Your Mind?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Premium gives you unlimited access to all book summaries, audio narration, and offline
              downloads. You can try it risk-free with our 7-day free trial!
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left max-w-md mx-auto">
              <li>✅ Cancel anytime, no questions asked</li>
              <li>✅ Full refund within 7 days</li>
              <li>✅ Access 454+ book summaries</li>
              <li>✅ Ad-free experience</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/pricing" className="btn-primary inline-flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Try Again
            </Link>
            <Link href="/library" className="btn-outline inline-flex items-center justify-center">
              Browse Free Books
            </Link>
          </motion.div>

          {/* Support Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-8"
          >
            Have questions?{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 underline">
              Contact our support team
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
