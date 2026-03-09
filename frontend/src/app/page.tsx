import { cookies } from 'next/headers';
import { Features } from '@/components/home/Features';
import { CTASection } from '@/components/home/CTASection';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBooks } from '@/components/home/FeaturedBooks';
import { Testimonials } from '@/components/home/Testimonials';

export default async function HomePage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';
  
  return (
    <div className="min-h-screen">
      <HeroSection language={language} />
      <FeaturedBooks language={language} />
      <Features />
      <Testimonials />
      <CTASection />
    </div>
  );
}
