'use client';

import { Loader2 } from 'lucide-react';

interface LoadingMessageProps {
  message?: string;
  submessage?: string;
}

export function LoadingMessage({ 
  message = "Loading books...", 
  submessage = "This may take a moment on first visit"
}: LoadingMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {message}
      </p>
      {submessage && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {submessage}
        </p>
      )}
    </div>
  );
}
