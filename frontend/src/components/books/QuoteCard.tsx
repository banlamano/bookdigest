'use client';

import { useState } from 'react';
import { Quote, Copy, Check } from 'lucide-react';

interface QuoteCardProps {
  quote: string | { quote: string; context?: string; significance?: string };
  index: number;
}

export default function QuoteCard({ quote, index }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const quoteText = typeof quote === 'string' ? quote : quote.quote;
  const context = typeof quote === 'object' && quote.context ? quote.context : null;
  const significance = typeof quote === 'object' && quote.significance ? quote.significance : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-purple-600 dark:border-purple-400 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <Quote className="flex-shrink-0 w-8 h-8 text-purple-600 dark:text-purple-400 opacity-50" />
        <div className="flex-1">
          <p className="text-lg italic text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
            "{quoteText}"
          </p>
          {(context || significance) && (
            <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/30 space-y-2">
              {context && (
                <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">Kontext:</span> {context}</p>
              )}
              {significance && (
                <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">Bedeutung:</span> {significance}</p>
              )}
            </div>
          )}
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
