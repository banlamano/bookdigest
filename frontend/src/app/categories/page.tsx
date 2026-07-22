import { cookies } from 'next/headers';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

/**
 * Fetch the categories on the server so the shipped HTML already contains real
 * <a href="/categories/..."> links. This page used to be a pure client
 * component, which meant Googlebot received an empty shell and had no crawl
 * path from the site root down to the ~900 book pages.
 */
async function getCategories(language: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/categories?language=${language}`, {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.categories ?? [];
  } catch (error) {
    // A failed fetch must not break the page — the client query still runs.
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const language = cookies().get('language')?.value === 'de' ? 'de' : 'en';
  const categories = await getCategories(language);

  return <CategoriesClient initialCategories={categories} />;
}
