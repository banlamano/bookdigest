'use client';

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
}

import { useLanguage } from '@/components/LanguageProvider';

export default function EnhancedBookContent({
  summary,
  keyInsights,
  chapters,
  quotes,
  actionItems
}: EnhancedBookContentProps) {
  const { t } = useLanguage();
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
        <div className="prose dark:prose-invert max-w-none">
          {summary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
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
              <InsightCard key={index} insight={insight} index={index} />
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
              <ChapterCard key={index} chapter={chapter} />
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
