import Link from 'next/link';
import { BookOpen, Headphones, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { Features } from '@/components/home/Features';
import { Testimonials } from '@/components/home/Testimonials';
import { CTASection } from '@/components/home/CTASection';
import dynamic from 'next/dynamic';

// Import FeaturedBooks with SSR disabled to prevent hydration errors from useEffect
const FeaturedBooks = dynamic(() => import('@/components/home/FeaturedBooks').then(mod => ({ default: mod.FeaturedBooks })), {
  ssr: false,
  loading: () => (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Summaries
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start with our most popular book summaries
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedBooks />
      <Features />
      <Testimonials />
      <CTASection />
    </div>
  );
}
