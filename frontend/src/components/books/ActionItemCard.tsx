'use client';

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ActionItemCardProps {
  action: string;
  index: number;
}

export default function ActionItemCard({ action, index }: ActionItemCardProps) {
  const [checked, setChecked] = useState(false);

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
            className={`text-gray-800 dark:text-gray-200 leading-relaxed ${
              checked ? 'line-through opacity-75' : ''
            }`}
          >
            {action}
          </p>
        </div>
      </div>
    </div>
  );
}
