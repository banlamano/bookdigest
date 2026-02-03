'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      avatar: 'SJ',
      rating: 5,
      text: 'BookDigest has transformed how I learn. I can now finish a book in my lunch break and apply the insights immediately to my business.',
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: 'MC',
      rating: 5,
      text: 'The audio feature is a game-changer. I listen during my commute and have learned more in the past 3 months than the entire last year.',
    },
    {
      name: 'Emma Williams',
      role: 'Marketing Manager',
      avatar: 'EW',
      rating: 5,
      text: 'Amazing platform! The summaries are incredibly well-written and the key insights are exactly what I need for professional growth.',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by thousands of learners
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See what our community has to say
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
