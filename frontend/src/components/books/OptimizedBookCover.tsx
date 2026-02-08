'use client';

import { useState } from 'react';
import Image from 'next/image';
import GeneratedBookCover from './GeneratedBookCover';

interface OptimizedBookCoverProps {
  src: string;
  alt: string;
  title?: string;
  author?: string;
  category?: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedBookCover({ 
  src, 
  alt, 
  title, 
  author, 
  category,
  className = '', 
  priority = false 
}: OptimizedBookCoverProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if this is a known broken URL (OpenLibrary)
  const isBrokenUrl = src && (
    src.includes('openlibrary.org') ||
    src.includes('placeholder-book.svg') ||
    src === '' ||
    !src.trim()
  );

  const handleError = () => {
    console.log(`Image failed to load: ${imgSrc}`);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // If we know the URL is broken or there's an error, show generated cover
  if (isBrokenUrl || hasError) {
    // Extract title and author from alt text if not provided
    const fallbackTitle = title || alt.split(' by ')[0] || alt || 'Book Title';
    const fallbackAuthor = author || (alt.includes(' by ') ? alt.split(' by ')[1] : 'Author');
    
    return (
      <div className="relative w-full h-full">
        <GeneratedBookCover
          title={fallbackTitle}
          author={fallbackAuthor}
          category={category}
          width={300}
          height={450}
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={85}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}
    </div>
  );
}
