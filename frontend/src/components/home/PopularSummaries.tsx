import Link from 'next/link';

/**
 * Server-rendered list of summaries that already draw real Google searches
 * (Search Console, Nov 2026) but rank on page 2-3. Plain <a href> links from
 * the homepage — the site's strongest page — tell Google these pages matter.
 * Kept static on purpose: the list should change only when the data says so.
 */
const BOOKS = [
  { slug: 'britt-marie-was-here-fredrik-backman', title: 'Britt-Marie Was Here', author: 'Fredrik Backman' },
  { slug: 'and-the-mountains-echoed-khaled-hosseini', title: 'And the Mountains Echoed', author: 'Khaled Hosseini' },
  { slug: 'room-emma-donoghue', title: 'Room', author: 'Emma Donoghue' },
  { slug: 'still-me-jojo-moyes', title: 'Still Me', author: 'Jojo Moyes' },
  { slug: 'the-rosie-effect-graeme-simsion', title: 'The Rosie Effect', author: 'Graeme Simsion' },
];

const LISTS = [
  {
    slug: 'master-productivity-top-books-to-beat-distraction-and-get-more-done',
    en: 'Best books on focus and productivity',
    de: 'Die besten Bücher über Fokus und Produktivität',
  },
  {
    slug: 'top-10-business-books-2026',
    en: 'Top 10 business & management books of 2026',
    de: 'Die 10 besten Business- & Management-Bücher 2026',
  },
  {
    slug: '10-best-fiction-books-to-read-in-2026',
    en: '10 best fiction books to read in 2026',
    de: 'Die 10 besten Romane für 2026',
  },
];

export function PopularSummaries({ language }: { language: string }) {
  const isDe = language === 'de';

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800" aria-labelledby="popular-summaries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="popular-summaries" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isDe ? 'Beliebte Zusammenfassungen' : 'Popular book summaries'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isDe
            ? 'Was Leser gerade suchen — Handlung, Themen und Kernaussagen in 15 Minuten.'
            : 'What readers are searching for right now — plot, themes and key takeaways in 15 minutes.'}
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <ul className="space-y-3">
            {BOOKS.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/books/${b.slug}`}
                  className="block rounded-lg bg-white dark:bg-gray-900 px-4 py-3 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {b.title} {isDe ? 'Zusammenfassung' : 'Summary'}
                  </span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">{b.author}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isDe ? 'Leselisten' : 'Reading lists'}
            </h3>
            <ul className="space-y-3">
              {LISTS.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/blog/${l.slug}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {isDe ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
