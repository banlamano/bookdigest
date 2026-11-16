import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import FAQSchema from '@/components/FAQSchema';
import { Features } from '@/components/home/Features';
import { CTASection } from '@/components/home/CTASection';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBooks } from '@/components/home/FeaturedBooks';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://book-digest.com',
    languages: {
      en: 'https://book-digest.com',
      de: 'https://book-digest.com/de',
      'x-default': 'https://book-digest.com',
    },
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

/**
 * Featured books are fetched server-side so the home page ships with real
 * /books/ links. Previously they were loaded only in the browser, so the
 * crawler's entry point into the site contained no links to any book page.
 */
async function getFeaturedBooks(language: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/books?limit=6&language=${language}`, {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.books ?? [];
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
}

export default async function HomePage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';
  const featuredBooks = await getFeaturedBooks(language);

  return (
    <div className="min-h-screen">
      {/* Homepage FAQ schema lives here, not in the root layout: site-wide it
          duplicated the FAQPage block on every book page and put the homepage
          FAQ on blog posts. */}
      <FAQSchema />
      <HeroSection language={language} />
      <FeaturedBooks language={language} initialBooks={featuredBooks} />
      <Features />

      <CTASection />
    </div>
  );
}
