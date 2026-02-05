'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

/**
 * ImagePreloader - Preloads images for instant display
 * Used for above-the-fold content and featured books
 * Improves perceived performance dramatically
 */
export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return;

    const preloadImages = () => {
      images.forEach((src, index) => {
        // Stagger preloading slightly to avoid overwhelming the browser
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          
          if (priority && index < 3) {
            link.setAttribute('fetchpriority', 'high');
          }
          
          document.head.appendChild(link);
        }, index * 50); // 50ms stagger
      });
    };

    // Preload immediately if priority, otherwise wait for page to be interactive
    if (priority) {
      preloadImages();
    } else {
      if (document.readyState === 'complete') {
        preloadImages();
      } else {
        window.addEventListener('load', preloadImages);
        return () => window.removeEventListener('load', preloadImages);
      }
    }
  }, [images, priority]);

  return null; // This component doesn't render anything
}
