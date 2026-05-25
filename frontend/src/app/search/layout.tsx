import { Metadata } from 'next';

// Search results pages have no canonical content to index.
// Telling Google to skip them avoids "Crawled - currently not indexed" warnings
// and keeps crawl budget on real content (book pages, categories, etc.).
export const metadata: Metadata = {
  title: 'Search - BookDigest',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
