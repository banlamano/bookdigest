import React from 'react';

/**
 * Book-specific FAQ block for /books/[id].
 *
 * Two jobs:
 *  1. Visible, accessible Q&A (native <details>/<summary>, no JS) that targets the
 *     long-tail "summary / what is X about / how long / themes" queries we already
 *     see in Search Console — this adds intent-matching content depth, which helps
 *     the page's *position* (the real bottleneck).
 *  2. FAQPage JSON-LD whose text mirrors the visible questions/answers exactly
 *     (Google requires FAQ structured data to match on-page content). Note: since
 *     Google's 2023 change, FAQ rich results are limited to authoritative gov/health
 *     sites, so this markup is for machine-readability / AI Overviews, not a classic
 *     rich snippet.
 *
 * Answers are built only from real book fields — nothing is fabricated.
 */

type FaqItem = { q: string; a: string };

function stripHtml(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max = 320): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`;
}

function buildFaqItems(book: any): FaqItem[] {
  const isDe = book?.language === 'de';
  const title: string = book?.title ?? '';
  const author: string = book?.author ?? '';
  const readingTime: number = book?.readingTime || 15;
  const category: string | undefined = book?.category?.name;
  const year: number | string | undefined = book?.publishedYear;
  const about = truncate(stripHtml(book?.description));
  const hasAudio = book?.audioUrl && book.audioUrl !== 'browser-tts';

  const items: FaqItem[] = [];

  // 1) What is <book> about?  (targets "<book> about / synopsis / summary")
  items.push({
    q: isDe ? `Worum geht es in „${title}“?` : `What is ${title} about?`,
    a:
      about ||
      (isDe
        ? `„${title}“ von ${author} wird auf Book Digest in einer kostenlosen Zusammenfassung mit den zentralen Ideen, Themen und Kernaussagen erklärt — lesbar in etwa ${readingTime} Minuten.`
        : `${title} by ${author} is covered in a free summary on Book Digest that walks through the book's central ideas, themes, and key takeaways — readable in about ${readingTime} minutes.`),
  });

  // 2) Who wrote it?
  items.push({
    q: isDe ? `Wer hat „${title}“ geschrieben?` : `Who wrote ${title}?`,
    a: isDe
      ? `„${title}“ stammt von ${author}.${year ? ` Das Buch erschien ${year}.` : ''}`
      : `${title} was written by ${author}.${year ? ` It was published in ${year}.` : ''}`,
  });

  // 3) How long to read the summary?  (targets "how long / read in X minutes")
  items.push({
    q: isDe
      ? `Wie lange dauert die Zusammenfassung von „${title}“?`
      : `How long does it take to read the ${title} summary?`,
    a: isDe
      ? `Die Zusammenfassung von „${title}“ lässt sich in etwa ${readingTime} Minuten lesen — rund 10 Stunden schneller als das ganze Buch, deckt aber die wichtigsten Erkenntnisse, Themen und Kernaussagen ab.`
      : `The ${title} summary takes about ${readingTime} minutes to read — roughly 10+ hours faster than the full book, while still covering the key insights, themes, and main takeaways.`,
  });

  // 4) Key takeaways / main themes  (targets "key takeaways / themes / main ideas")
  items.push({
    q: isDe
      ? `Was sind die wichtigsten Erkenntnisse aus „${title}“?`
      : `What are the key takeaways from ${title}?`,
    a: isDe
      ? `Die Zusammenfassung bricht „${title}“ auf seine Kernideen herunter — zentrale Erkenntnisse, prägnante Zitate und umsetzbare Kernaussagen. Die vollständige Analyse findest du oben auf dieser Seite.`
      : `The summary distills ${title} into its core ideas — the key insights, memorable quotes, and actionable takeaways. You can read the full breakdown above on this page.`,
  });

  // 5) Genre / category (only when known)
  if (category) {
    items.push({
      q: isDe
        ? `Zu welchem Genre gehört „${title}“?`
        : `What genre is ${title}?`,
      a: isDe
        ? `„${title}“ ist im Bereich ${category} eingeordnet. Weitere Zusammenfassungen aus dieser Kategorie findest du auf Book Digest.`
        : `${title} falls under ${category}. You can find more summaries in this category on Book Digest.`,
    });
  }

  // 6) Free access (factual — freemium: 3 summaries/month)
  items.push({
    q: isDe
      ? `Kann ich die Zusammenfassung von „${title}“ kostenlos lesen?`
      : `Can I read the ${title} summary for free?`,
    a: isDe
      ? `Ja. Die Zusammenfassung von „${title}“ ist auf Book Digest kostenlos verfügbar — kostenlose Mitglieder lesen 3 vollständige Zusammenfassungen pro Monat, ohne Kreditkarte.`
      : `Yes. You can read the ${title} summary on Book Digest for free — free members get 3 full summaries every month, with no credit card required.`,
  });

  // 7) Audio (only when a real narration exists)
  if (hasAudio) {
    items.push({
      q: isDe
        ? `Gibt es „${title}“ auch als Audio-Zusammenfassung?`
        : `Is there an audio version of the ${title} summary?`,
      a: isDe
        ? `Ja — „${title}“ enthält eine gesprochene Audio-Zusammenfassung, die du unterwegs anhören kannst. Starte die Wiedergabe oben auf der Seite.`
        : `Yes — ${title} includes a narrated audio summary so you can listen on the go. Press play near the top of the page.`,
    });
  }

  return items;
}

export function BookFAQ({ book }: { book: any }) {
  if (!book?.title || !book?.author) return null;

  const isDe = book?.language === 'de';
  const items = buildFaqItems(book);
  if (items.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  };

  return (
    <section aria-labelledby="book-faq-heading" className="mt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2
        id="book-faq-heading"
        className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-5"
      >
        {isDe ? 'Häufige Fragen' : 'Frequently Asked Questions'}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <details
            key={i}
            className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 [&_summary]:list-none"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-gray-900 dark:text-gray-100 marker:hidden">
              <span>{it.q}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              {it.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default BookFAQ;
