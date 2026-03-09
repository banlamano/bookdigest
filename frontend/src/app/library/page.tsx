import { cookies } from 'next/headers';
import { BookCardSkeleton } from '@/components/books/BookCardSkeleton';
import LibraryClient from './LibraryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LibraryPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';
  
  return <LibraryClient language={language} />;
}
