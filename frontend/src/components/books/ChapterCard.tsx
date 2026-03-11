'use client';

import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

interface ChapterCardProps {
  chapter: {
    number?: number;
    chapter?: number;
    title: string;
    summary: string;
    keyTakeaway?: string;
  };
  index?: number;
}

export default function ChapterCard({ chapter, index }: ChapterCardProps) {
  const { t } = useLanguage();
  const chapterNum = chapter.number || chapter.chapter || index;
  
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('bookDetail.chapter')} {chapterNum}
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {chapter.title}
            </h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            {chapter.summary}
          </p>
          {chapter.keyTakeaway && (
            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-2 border-blue-400">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">💡 Key Takeaway:</span> {chapter.keyTakeaway}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
