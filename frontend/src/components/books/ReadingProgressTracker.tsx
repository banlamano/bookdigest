'use client';

import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReadingProgressTrackerProps {
  bookId: string;
  bookTitle: string;
}

export function ReadingProgressTracker({ bookId, bookTitle }: ReadingProgressTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { token, isAuthenticated } = useAuthStore();
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track time spent on page
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)); // minutes
    }, 60000); // Update every minute

    // Track scroll progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(Math.round(scrollPercentage), 100));
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      
      // Save progress on unmount
      if (isAuthenticated && token) {
        const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
        saveProgress(progress, finalTimeSpent, progress >= 90);
      }
    };
  }, []);

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { progress: number; timeSpent: number; isCompleted: boolean }) => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/progress`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
  });

  const saveProgress = (currentProgress: number, minutes: number, completed: boolean) => {
    if (!isAuthenticated || !token) return;

    updateProgressMutation.mutate({
      progress: currentProgress,
      timeSpent: minutes,
      isCompleted: completed,
    });
  };

  useEffect(() => {
    // Auto-complete when reaching 90% progress
    if (progress >= 90 && !isCompleted && isAuthenticated) {
      setIsCompleted(true);
      const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      saveProgress(progress, finalTimeSpent, true);
      toast.success(`🎉 Completed: ${bookTitle}`, {
        duration: 5000,
        icon: '✅',
      });
    }
  }, [progress, isCompleted, isAuthenticated]);

  if (!isAuthenticated || progress === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="card p-4 shadow-lg max-w-xs bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Reading Progress
          </span>
          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>
        
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{progress}% complete</span>
          <span>{timeSpent} min</span>
        </div>
      </div>
    </div>
  );
}
