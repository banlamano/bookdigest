'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export function Testimonials() {
  const { t } = useLanguage();
  const testimonials = [
    {
      name: t('testimonials.name1'),
      role: t('testimonials.role1'),
      avatar: 'SJ',
      rating: 5,
      text: t('testimonials.sarah'),
    },
    {
      name: t('testimonials.name2'),
      role: t('testimonials.role2'),
      avatar: 'MC',
      rating: 5,
      text: t('testimonials.michael'),
    },
    {
      name: t('testimonials.name3'),
      role: t('testimonials.role3'),
      avatar: 'EW',
      rating: 5,
      text: t('testimonials.emma'),
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{testimonial.text}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
