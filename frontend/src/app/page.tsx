import Link from 'next/link';
import { BookOpen, Headphones, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { Features } from '@/components/home/Features';
import { CTASection } from '@/components/home/CTASection';
import dynamic from 'next/dynamic';

// Import all client-side components with SSR disabled to prevent hydration errors
// HeroSection and Testimonials use framer-motion which can cause hydration issues
const HeroSection = dynamic(() => import('@/components/home/HeroSection').then(mod => ({ default: mod.HeroSection })), {
  ssr: false,
});

const FeaturedBooks = dynamic(() => import('@/components/home/FeaturedBooks').then(mod => ({ default: mod.FeaturedBooks })), {
  ssr: false,
});

const Testimonials = dynamic(() => import('@/components/home/Testimonials').then(mod => ({ default: mod.Testimonials })), {
  ssr: false,
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
