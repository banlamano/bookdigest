import Link from 'next/link';
import { OptimizedBookCover } from '@/components/books/OptimizedBookCover';

/**
 * "Related books" cross-links on /books/[id].
 *
 * SEO purpose: give every book page crawlable outbound links to sibling pages in
 * the same category, and give those siblings inbound links back. This spreads
 * internal authority (PageRank) across the catalog instead of trapping it on a
 * handful of pages — the main lever for lifting book-page *positions*.
 *
 * Data is fetched server-side in page.tsx and passed as props, so the <a href>
 * links live in the initial HTML and Googlebot crawls them without running JS.
 */

export interface RelatedBookLink {
  id: string;
  slug: string;
  title: string;
  author?: string;
  coverImage?: string;
}

export function RelatedBooks({
  books,
  isDe = false,
  categoryName,
}: {
  books: RelatedBookLink[];
  isDe?: boolean;
  categoryName?: string;
}) {
  if (!books || books.length === 0) return null;

  const heading = isDe ? 'Verwandte Buch-Zusammenfassungen' : 'Related Book Summaries';
  const sub = categoryName
    ? isDe
      ? `Mehr aus ${categoryName}`
      : `More in ${categoryName}`
    : isDe
      ? 'Diese Zusammenfassungen könnten dich auch interessieren'
      : 'You might also like these summaries';

  return (
    <section aria-labelledby="related-books-heading" className="mt-12">
      <div className="mb-5">
        <h2
          id="related-books-heading"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {heading}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.map((b) => (
          <Link
            key={b.id}
            href={`/books/${b.slug}`}
            className="group block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 transition-shadow hover:shadow-md"
          >
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <OptimizedBookCover
                src={b.coverImage}
                title={b.title}
                author={b.author}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="mt-2">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {b.title}
              </p>
              {b.author && (
                <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {b.author}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedBooks;
