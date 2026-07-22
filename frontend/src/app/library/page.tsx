import { cookies } from 'next/headers';
import LibraryClient from './LibraryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

/**
 * Fetch the first page of books on the server so /library ships with real
 * /books/ links. The grid used to be filled only in the browser, which left
 * the library — the most obvious crawl hub on the site — link-free for bots.
 */
async function getInitialBooks(language: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/books?limit=20&language=${language}`, {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.books ?? [];
  } catch (error) {
    console.error('Error fetching library books:', error);
    return [];
  }
}

export default async function LibraryPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';
  const initialBooks = await getInitialBooks(language);

  return <LibraryClient language={language} initialBooks={initialBooks} />;
}
