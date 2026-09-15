'use client';

import Link from 'next/link';
import { Lightbulb, Quote, CheckSquare, BookOpen, Sparkles } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import InsightCard from './InsightCard';
import QuoteCard from './QuoteCard';
import ActionItemCard from './ActionItemCard';
import ChapterCard from './ChapterCard';

interface EnhancedBookContentProps {
  summary: string;
  keyInsights?: string;
  chapters?: string;
  quotes?: string;
  actionItems?: string;
  isAuthenticated?: boolean;
  isPublicDemo?: boolean;
}

import { useLanguage } from '@/components/LanguageProvider';

export default function EnhancedBookContent({
  summary,
  keyInsights,
  chapters,
  quotes,
  actionItems,
  isAuthenticated = false,
  isPublicDemo = false
}: EnhancedBookContentProps) {
  const { t, language } = useLanguage();
  // Parse JSON strings
  const parsedInsights = keyInsights ? tryParseJSON(keyInsights) : [];
  const parsedChapters = chapters ? tryParseJSON(chapters) : [];
  const parsedQuotes = quotes ? tryParseJSON(quotes) : [];
  const parsedActions = actionItems ? tryParseJSON(actionItems) : [];

  // If no summary, don't render anything
  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Section - Always visible */}
      <div
        id="book-summary"
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('bookContent.summary')}
          </h2>
        </div>
        <div className={`prose dark:prose-invert max-w-none ${(!isAuthenticated && !isPublicDemo) ? 'relative max-h-[600px] overflow-hidden' : ''}`}>
          {summary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
          
          {(!isAuthenticated && !isPublicDemo) && (
            <>
              {/* Fade out effect */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-50 dark:from-gray-800 to-transparent pointer-events-none"></div>
              {/* Sign-up CTA — turns the freemium cut-off into an invitation to read on */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-4 pb-6 pt-20 text-center">
                <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                  {t('bookContent.unlockText')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700"
                  >
                    {t('bookContent.unlockCta')}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-200"
                  >
                    {t('nav.login')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Key Insights Section */}
      {parsedInsights.length > 0 && (
        <CollapsibleSection
          title={t('bookContent.keyInsights')}
          icon={<Lightbulb className="w-6 h-6" />}
          badge={parsedInsights.length}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {parsedInsights.map((insight: any, index: number) => (
              <InsightCard key={index} insight={insight} index={index} language={language} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Memorable Quotes Section */}
      {parsedQuotes.length > 0 && (
        <CollapsibleSection
          title={t('bookContent.quotes')}
          icon={<Quote className="w-6 h-6" />}
          badge={parsedQuotes.length}
          defaultOpen={false}
        >
          <div className="space-y-4">
            {parsedQuotes.map((quote: string, index: number) => (
              <QuoteCard key={index} quote={quote} index={index} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Chapter Breakdown Section */}
      {parsedChapters.length > 0 && (
        <CollapsibleSection
          title={t('bookContent.chapters')}
          icon={<BookOpen className="w-6 h-6" />}
          badge={parsedChapters.length}
          defaultOpen={false}
        >
          <div className="space-y-4">
            {parsedChapters.map((chapter: any, index: number) => (
              <ChapterCard key={index} chapter={chapter} index={index + 1} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Action Items Section */}
      {parsedActions.length > 0 && (
        <CollapsibleSection
          title={t('bookContent.actionItems')}
          icon={<CheckSquare className="w-6 h-6" />}
          badge={parsedActions.length}
          defaultOpen={false}
        >
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>{t('bookContent.tip')}:</strong> {t('bookContent.tipDesc')}
            </p>
          </div>
          <div className="space-y-3">
            {parsedActions.map((action: string, index: number) => (
              <ActionItemCard key={index} action={action} index={index} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// Helper function to safely parse JSON
function tryParseJSON(jsonString: string | any): any[] {
  // If it's already an array, return it
  if (Array.isArray(jsonString)) {
    return jsonString;
  }

  // If it's already an object (not a string), try to use it
  if (typeof jsonString === 'object' && jsonString !== null) {
    return Array.isArray(jsonString) ? jsonString : [];
  }

  // If it's a string, try to parse it
  if (typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse JSON string:', error);
      return [];
    }
  }

  // Otherwise return empty array
  return [];
}
