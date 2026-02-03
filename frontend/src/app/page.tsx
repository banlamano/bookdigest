import Link from 'next/link';
import { BookOpen, Headphones, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBooks } from '@/components/home/FeaturedBooks';
import { Features } from '@/components/home/Features';
import { Testimonials } from '@/components/home/Testimonials';
import { CTASection } from '@/components/home/CTASection';

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
