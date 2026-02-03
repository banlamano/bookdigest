'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: 'monthly' | 'yearly' | 'team') => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      router.push('/login');
      return;
    }

    setIsLoading(planType);
    try {
      const response = await paymentAPI.createCheckoutSession(planType);
      const { url } = response.data.data;
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 book summaries per month',
        'Basic reading features',
        'Limited audio access',
        'Mobile app access',
      ],
      cta: 'Get Started',
      highlighted: false,
      planType: null,
    },
    {
      name: 'Premium Monthly',
      price: '€9.99',
      period: 'per month',
      description: 'For serious learners',
      features: [
        'Unlimited book summaries',
        'Full audio narration',
        'Offline downloads',
        'Ad-free experience',
        'Priority customer support',
        'Early access to new content',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      planType: 'monthly' as const,
    },
    {
      name: 'Premium Yearly',
      price: '€79.99',
      period: 'per year',
      badge: 'Save 33%',
      description: 'Best value for committed learners',
      features: [
        'Everything in Monthly',
        'Save €40 per year',
        'Exclusive annual content',
        'Premium member badge',
        'Gift subscriptions',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
      planType: 'yearly' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Start with a 7-day free trial. Cancel anytime, no questions asked.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card p-8 relative ${
                plan.highlighted
                  ? 'ring-2 ring-primary-600 shadow-xl scale-105'
                  : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.planType && handleSubscribe(plan.planType)}
                disabled={!plan.planType || isLoading === plan.planType}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading === plan.planType ? 'Processing...' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Team Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Team Plan</h3>
              <p className="text-primary-100 mb-6">
                Perfect for companies and organizations. Get bulk discounts and admin features.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  5+ user licenses
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Team analytics dashboard
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Custom onboarding
                </li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl font-bold mb-4">€49.99</div>
              <div className="text-primary-100 mb-6">per month for 5 users</div>
              <button
                onClick={() => handleSubscribe('team')}
                disabled={isLoading === 'team'}
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading === 'team' ? 'Processing...' : 'Contact Sales'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Have questions? We're here to help.
          </p>
          <a
            href="mailto:support@bookdigest.com"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}
