'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Gift, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/components/LanguageProvider';

export default function EmailCapturePopup() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup or subscribed
    const hasSeenPopup = localStorage.getItem('emailPopupSeen');
    const hasSubscribed = localStorage.getItem('emailSubscribed');

    if (!hasSeenPopup && !hasSubscribed) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('emailPopupSeen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(t('emailPopup.errorInvalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the email capture API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email-capture/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language, source: 'popup' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('emailPopup.errorGeneric'));
      }

      // Save subscription status to localStorage
      localStorage.setItem('emailSubscribed', 'true');

      toast.success(t('emailPopup.success'));
      setIsOpen(false);
      setEmail('');
    } catch (error: any) {
      console.error('Email capture error:', error);
      toast.error(error.message || t('emailPopup.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close popup"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
                {t('emailPopup.title')}
              </h2>

              {/* Subheading */}
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {t('emailPopup.subtitle')}
                {' '}{t('emailPopup.discount')} <span className="font-bold text-primary-600">{t('emailPopup.discountAmount')}</span>
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{t('emailPopup.benefit1Bold')}</span> {t('emailPopup.benefit1')}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{t('emailPopup.benefit2Bold')}</span> {t('emailPopup.benefit2')}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{t('emailPopup.benefit3Bold')}</span> {t('emailPopup.benefit3')}
                  </p>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPopup.placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? t('emailPopup.submitting') : t('emailPopup.submit')}
                </button>
              </form>

              {/* Trust Badge */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                {t('emailPopup.privacy')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
