'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedBookCoverProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedBookCover({ src, alt, className = '', priority = false }: OptimizedBookCoverProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log(`Image failed to load: ${imgSrc}`);
    
    // If it's already the placeholder, don't try again
    if (imgSrc.includes('placeholder-book.jpg')) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Try fallback to placeholder
    setImgSrc('/placeholder-book.jpg');
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

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
        unoptimized={hasError} // Use unoptimized for fallback
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}
      
      {hasError && imgSrc.includes('placeholder-book.jpg') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500">Cover unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
