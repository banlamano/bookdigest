'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedBookCoverProps {
  src: string;
  alt: string;
  /** Book id used for local AI-cover fallback (/ai-covers/<id>.svg) */
  bookId?: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedBookCover({ src, alt, bookId, className = '', priority = false }: OptimizedBookCoverProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aiCoverSrc = bookId ? `/ai-covers/${bookId}.svg` : null;

  const handleError = () => {
    // If it's already the placeholder SVG, don't try again
    if (imgSrc.includes('placeholder-book.svg')) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // If current source is an AI cover, final fallback is the placeholder
    if (aiCoverSrc && imgSrc.includes(aiCoverSrc)) {
      setImgSrc('/placeholder-book.svg');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // First failure: retry the SAME URL but bypass Next image optimization.
    // This helps when some remote hosts intermittently fail through the optimizer under load.
    if (!hasError) {
      const sep = imgSrc.includes('?') ? '&' : '?';
      setImgSrc(`${imgSrc}${sep}retry=1`);
      setHasError(true);
      setIsLoading(true);
      return;
    }

    // Second failure: fallback to local AI cover if available, otherwise placeholder
    if (aiCoverSrc) {
      setImgSrc(aiCoverSrc);
      setHasError(true);
      setIsLoading(true);
      return;
    }

    setImgSrc('/placeholder-book.svg');
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
      
      {hasError && imgSrc.includes('placeholder-book.svg') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500">Cover unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
