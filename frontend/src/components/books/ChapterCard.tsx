'use client';

import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

interface ChapterCardProps {
  chapter: {
    number: number;
    title: string;
    summary: string;
  };
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const { t } = useLanguage();
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('bookDetail.chapter')} {chapter.number}
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {chapter.title}
            </h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {chapter.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
