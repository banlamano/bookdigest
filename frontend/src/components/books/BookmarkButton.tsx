'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface BookmarkButtonProps {
  bookId: string;
  initialIsFavorite?: boolean;
}

export function BookmarkButton({ bookId, initialIsFavorite = false }: BookmarkButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isFavorite) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/favorite`,
          config
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/favorite`,
          {},
          config
        );
      }
    },
    onMutate: () => {
      // Optimistic update
      setIsFavorite(!isFavorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: () => {
      // Revert optimistic update
      setIsFavorite(isFavorite);
      toast.error('Failed to update favorites');
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleFavoriteMutation.isPending}
      className={`p-2 rounded-full transition-all ${
        isFavorite
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
