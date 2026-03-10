'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '@/lib/api';
import { Crown, Calendar, CreditCard, XCircle, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

export default function SubscriptionCard() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch subscription status
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => paymentAPI.getSubscriptionStatus(),
    // Refetch every minute to keep status fresh
    refetchInterval: 60 * 1000,
  });

  const subscriptionData = data?.data?.data;
  const subscriptionType = subscriptionData?.subscriptionType || 'FREE';
  const subscriptionEnd = subscriptionData?.subscriptionEnd;
  const details = subscriptionData?.details;

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: () => paymentAPI.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      toast.success(t('subscriptionCard.cancelSuccess'));
      setShowCancelConfirm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  // Check if user is premium AND subscription is not expired
  const isPremium = subscriptionType !== 'FREE' &&
    subscriptionEnd &&
    new Date(subscriptionEnd) > new Date();
  const isCanceled = details?.cancelAtPeriodEnd;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            <Crown
              className={`w-6 h-6 ${isPremium ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isPremium ? t('subscriptionCard.premiumPlan') : t('subscriptionCard.freePlan')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subscriptionType.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      {isPremium ? (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-900 dark:text-green-100">
                {isCanceled ? t('subscriptionCard.activeCanceling') : t('subscriptionCard.active')}
              </span>
            </div>
            <span className="text-sm text-green-700 dark:text-green-300">
              {details?.status || 'active'}
            </span>
          </div>

          {/* Renewal Date */}
          {subscriptionEnd && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{isCanceled ? t('subscriptionCard.expiresOn') : t('subscriptionCard.renewsOn')}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(subscriptionEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <CreditCard className="w-5 h-5" />
              <span>{t('subscriptionCard.paymentMethod')}</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {details?.paymentMethod?.brand
                ? `${String(details.paymentMethod.brand).toUpperCase()} •••• ${details.paymentMethod.last4}`
                : t('subscriptionCard.cardOnFile')}
            </span>
          </div>

          {/* Benefits */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('subscriptionCard.premiumBenefits')}
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary-600 mr-2" />
                {t('subscriptionCard.unlimitedSummaries')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary-600 mr-2" />
                {t('subscriptionCard.fullAudio')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary-600 mr-2" />
                {t('subscriptionCard.offlineDownloads')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary-600 mr-2" />
                {t('subscriptionCard.adFree')}
              </li>
            </ul>
          </div>

          {/* Cancel Warning */}
          {isCanceled && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('subscriptionCard.cancelWarning').replace('{date}', new Date(subscriptionEnd).toLocaleDateString())}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {!isCanceled && (
              <>
                {showCancelConfirm ? (
                  <div className="w-full space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t('subscriptionCard.cancelSure')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        {cancelMutation.isPending ? t('subscriptionCard.canceling') : t('subscriptionCard.cancelButton')}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium"
                      >
                        {t('subscriptionCard.keepPremium')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="btn-outline flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('subscriptionCard.cancelSubscription')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        // Free Plan
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('subscriptionCard.upgradePrompt')}
            </p>
            <Link href="/pricing" className="btn-primary inline-block">
              <Crown className="w-4 h-4 mr-2 inline" />
              {t('subscriptionCard.upgradeButton')}
            </Link>
          </div>

          {/* Free Plan Benefits */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('subscriptionCard.freeIncludes')}
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-gray-400 mr-2" />
                {t('subscriptionCard.threeSummaries')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-gray-400 mr-2" />
                {t('subscriptionCard.basicFeatures')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-gray-400 mr-2" />
                {t('subscriptionCard.limitedAudio')}
              </li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}
