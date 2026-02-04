'use client';

import { useState } from 'react';
import { Quote, Copy, Check } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  index: number;
}

export default function QuoteCard({ quote, index }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-purple-600 dark:border-purple-400 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <Quote className="flex-shrink-0 w-8 h-8 text-purple-600 dark:text-purple-400 opacity-50" />
        <div className="flex-1">
          <p className="text-lg italic text-gray-800 dark:text-gray-200 leading-relaxed">
            "{quote}"
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Copy quote"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    </div>
  );
}
