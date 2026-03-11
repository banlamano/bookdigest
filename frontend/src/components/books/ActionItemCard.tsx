'use client';

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ActionItemCardProps {
  action: string | { action: string; outcome?: string; timeframe?: string; difficulty?: string };
  index: number;
}

export default function ActionItemCard({ action, index }: ActionItemCardProps) {
  const [checked, setChecked] = useState(false);

  const actionText = typeof action === 'string' ? action : action.action;
  const outcome = typeof action === 'object' && action.outcome ? action.outcome : null;
  const timeframe = typeof action === 'object' && action.timeframe ? action.timeframe : null;
  const difficulty = typeof action === 'object' && action.difficulty ? action.difficulty : null;

  return (
    <div
      className={`group p-4 bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
        checked
          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
      }`}
      onClick={() => setChecked(!checked)}
    >
      <div className="flex items-start gap-3">
        {checked ? (
          <CheckCircle className="flex-shrink-0 w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
        ) : (
          <Circle className="flex-shrink-0 w-6 h-6 text-gray-400 dark:text-gray-500 mt-0.5 group-hover:text-green-500" />
        )}
        <div className="flex-1">
          <p
            className={`text-gray-800 dark:text-gray-200 font-medium leading-relaxed ${
              checked ? 'line-through opacity-75' : ''
            }`}
          >
            {actionText}
          </p>
          
          {(outcome || timeframe || difficulty) && (
            <div className={`mt-3 space-y-2 transition-opacity ${checked ? 'opacity-50' : 'opacity-100'}`}>
              {outcome && (
                <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Erwartet:</span> {outcome}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {timeframe && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                    ⏱️ {timeframe}
                  </span>
                )}
                {difficulty && (
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                    ${difficulty.toLowerCase().includes('easy') || difficulty.toLowerCase().includes('leicht') ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 
                      difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('schwer') ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' : 
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'}`}
                  >
                    💪 {difficulty}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
