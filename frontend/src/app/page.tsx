import { cookies } from 'next/headers';
import { Features } from '@/components/home/Features';
import { CTASection } from '@/components/home/CTASection';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBooks } from '@/components/home/FeaturedBooks';

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
      <HeroSection language={language} />
      <FeaturedBooks language={language} initialBooks={featuredBooks} />
      <Features />

      <CTASection />
    </div>
  );
}
