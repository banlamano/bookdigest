'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Gift, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailCapturePopup() {
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
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with your actual email collection endpoint
      // For now, we'll just save to localStorage and show success
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage (replace with actual API call later)
      const subscribers = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
      subscribers.push({
        email,
        subscribedAt: new Date().toISOString(),
      });
      localStorage.setItem('emailSubscribers', JSON.stringify(subscribers));
      localStorage.setItem('emailSubscribed', 'true');

      toast.success('🎉 Success! Check your email for your free summaries!');
      setIsOpen(false);
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
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
                Get 3 Free Book Summaries!
              </h2>

              {/* Subheading */}
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Join 10,000+ readers learning from the best books in just 15 minutes.
                Plus, get early access to Premium with <span className="font-bold text-primary-600">20% off!</span>
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
                    <span className="font-semibold">3 hand-picked summaries</span> delivered instantly
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Weekly book recommendations</span> tailored to your interests
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Exclusive early access</span> to Premium (launching soon!)
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
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Subscribing...' : 'Get My Free Summaries →'}
                </button>
              </form>

              {/* Trust Badge */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                🔒 We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
