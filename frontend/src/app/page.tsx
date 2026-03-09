import { cookies } from 'next/headers';
import { BookOpen, Headphones, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { Features } from '@/components/home/Features';
import { CTASection } from '@/components/home/CTASection';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/home/HeroSection').then(mod => ({ default: mod.HeroSection })), {
  ssr: false,
});

const FeaturedBooks = dynamic(() => import('@/components/home/FeaturedBooks').then(mod => ({ default: mod.FeaturedBooks })), {
  ssr: false,
});

const Testimonials = dynamic(() => import('@/components/home/Testimonials').then(mod => ({ default: mod.Testimonials })), {
  ssr: false,
});

export default async function HomePage() {
  const cookieStore = cookies();
  const language = cookieStore.get(' || 'en';
  
  return (
    <div className="min-h-screen">
      <HeroSection language={language} />
     language')?.value <FeaturedBooks language={language} />
      <Features />
      <Testimonials />
      <CTASection />
    </div>
  );
}
