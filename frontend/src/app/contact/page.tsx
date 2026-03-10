'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/components/LanguageProvider';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(t('contact.sentSuccess'));
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('contact.formTitle')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.nameLabel')}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.subjectLabel')}
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder={t('contact.subjectLabel')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.messageLabel')}
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input"
                  placeholder={t('contact.messageLabel')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  t('contact.sending')
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t('contact.send')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="card p-8">
              <Mail className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('contact.emailUs')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t('contact.generalInquiries')}
              </p>
              <a href="mailto:support@bookdigest.com" className="text-primary-600 hover:text-primary-700">
                support@bookdigest.com
              </a>
            </div>

            <div className="card p-8">
              <MessageSquare className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('contact.feedback')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t('contact.valueFeedback')}
              </p>
              <a href="mailto:feedback@bookdigest.com" className="text-primary-600 hover:text-primary-700">
                feedback@bookdigest.com
              </a>
            </div>

            <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('contact.responseTime')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.responseDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
