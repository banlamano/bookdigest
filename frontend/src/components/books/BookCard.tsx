'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Headphones, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    readingTime: number;
    audioUrl?: string;
    rating: number;
    isPremium: boolean;
    category: {
      name: string;
      color?: string;
    };
  };
}

export function BookCard({ book }: BookCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="card group cursor-pointer"
    >
      <Link href={`/books/${book.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={book.coverImage || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2VmZjZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=="
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={85}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-book.jpg';
            }}
          />
          {book.isPremium && (
            <div className="absolute top-2 right-2">
              <span className="badge-premium text-xs px-2 py-1">Premium</span>
            </div>
          )}
          {book.audioUrl && (
            <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1.5">
              <Headphones className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: book.category.color || '#e0f2fe',
                color: '#0369a1',
              }}
            >
              {book.category.name}
            </span>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
                {book.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{book.author}</p>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>{book.readingTime} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
