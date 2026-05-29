/**
 * Compose the full narration text from every content section the UI shows,
 * not just the long-form summary. Earlier audio narration skipped key
 * insights, chapters, quotes, and action items — leaving listeners with
 * only ~30% of the visible content.
 *
 * Sections are joined with natural-language headers in the book's language
 * so the TTS voice produces a clear acoustic break between them.
 */

export type NarratableBook = {
  title: string;
  language: string;
  summary: string;
  keyInsights: any;   // Prisma Json: expected to be { title, impact, example, explanation }[]
  chapters: any;      // expected: { title, number, summary }[]
  quotes: any;        // expected: string[] (or { text }[])
  actionItems: any;   // expected: string[] (or { text }[])
};

function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const LABELS = {
  en: {
    insightsHeader: 'Now, the key insights from this book.',
    insightPrefix:  'Insight',
    chaptersHeader: 'Chapter by chapter breakdown.',
    chapterPrefix:  'Chapter',
    quotesHeader:   'Memorable quotes from the book.',
    actionHeader:   'And finally, action items you can apply.',
    actionPrefix:   'Action',
    exampleIntro:   'For example:',
  },
  de: {
    insightsHeader: 'Nun zu den wichtigsten Erkenntnissen dieses Buches.',
    insightPrefix:  'Erkenntnis',
    chaptersHeader: 'Kapitel für Kapitel.',
    chapterPrefix:  'Kapitel',
    quotesHeader:   'Einprägsame Zitate aus dem Buch.',
    actionHeader:   'Und zum Abschluss, Handlungsempfehlungen.',
    actionPrefix:   'Empfehlung',
    exampleIntro:   'Zum Beispiel:',
  },
} as const;

export function composeNarrationText(book: NarratableBook): string {
  const labels = book.language === 'de' ? LABELS.de : LABELS.en;
  const parts: string[] = [];

  // 1. Summary — long-form prose
  parts.push(book.summary.trim());

  // 2. Key insights
  const insights = asArray(book.keyInsights);
  if (insights.length > 0) {
    parts.push(`\n\n${labels.insightsHeader}`);
    insights.forEach((ins: any, i: number) => {
      if (typeof ins === 'string') {
        parts.push(`\n${labels.insightPrefix} ${i + 1}: ${ins}`);
        return;
      }
      const segs: string[] = [];
      if (ins.title) segs.push(String(ins.title).replace(/[.?!]$/, '') + '.');
      if (ins.impact) segs.push(String(ins.impact));
      if (ins.example) segs.push(`${labels.exampleIntro} ${ins.example}`);
      if (ins.explanation) segs.push(String(ins.explanation));
      parts.push(`\n${labels.insightPrefix} ${i + 1}: ${segs.join(' ')}`);
    });
  }

  // 3. Chapters
  const chapters = asArray(book.chapters);
  if (chapters.length > 0) {
    parts.push(`\n\n${labels.chaptersHeader}`);
    chapters.forEach((ch: any, i: number) => {
      if (typeof ch === 'string') {
        parts.push(`\n${labels.chapterPrefix} ${i + 1}. ${ch}`);
        return;
      }
      const num = ch.number ?? i + 1;
      const title = ch.title || '';
      const summary = ch.summary || '';
      parts.push(`\n${labels.chapterPrefix} ${num}: ${title}. ${summary}`);
    });
  }

  // 4. Quotes
  const quotes = asArray(book.quotes);
  if (quotes.length > 0) {
    parts.push(`\n\n${labels.quotesHeader}`);
    quotes.forEach((q: any, i: number) => {
      const text = typeof q === 'string' ? q : (q?.text || q?.quote || '');
      if (text) parts.push(`\n${i + 1}. ${text.replace(/^["“„]|["”]$/g, '').trim()}`);
    });
  }

  // 5. Action items
  const actions = asArray(book.actionItems);
  if (actions.length > 0) {
    parts.push(`\n\n${labels.actionHeader}`);
    actions.forEach((a: any, i: number) => {
      const text = typeof a === 'string' ? a : (a?.text || a?.action || '');
      if (text) parts.push(`\n${labels.actionPrefix} ${i + 1}: ${text}`);
    });
  }

  return parts.join(' ').replace(/\s+\n/g, '\n').trim();
}
