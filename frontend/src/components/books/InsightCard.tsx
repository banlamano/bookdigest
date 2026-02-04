'use client';

import { Lightbulb } from 'lucide-react';

interface InsightCardProps {
  insight: {
    title: string;
    description: string;
  };
  index: number;
}

export default function InsightCard({ insight, index }: InsightCardProps) {
  return (
    <div className="group relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}
