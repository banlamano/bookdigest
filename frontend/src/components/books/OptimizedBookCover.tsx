'use client';

import { useEffect, useState } from 'react';

interface OptimizedBookCoverProps {
  src: string;
  /** Title used for accessibility and for generated SVG fallback */
  alt: string;
  /** Optional author name for generated SVG fallback */
  author?: string;
  /** Book id used for local AI-cover fallback (/ai-covers/<id>.svg) */
  bookId?: string;
  className?: string;
  priority?: boolean;
}

function clampText(text: string, maxLen: number) {
  const t = (text || '').trim();
  return t.length > maxLen ? t.slice(0, maxLen - 1) + '…' : t;
}

function hashToHue(input: string) {
  // Simple deterministic hash -> hue [0..359]
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function makeGeneratedCoverDataUri(title: string, author?: string) {
  const safeTitle = clampText(title || 'Untitled', 42);
  const safeAuthor = clampText(author || '', 40);
  const hue1 = hashToHue(`${title}|${author || ''}`);
  const hue2 = (hue1 + 40) % 360;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1} 70% 45%)"/>
      <stop offset="100%" stop-color="hsl(${hue2} 70% 35%)"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="600" height="800" fill="url(#g)"/>

  <g filter="url(#shadow)">
    <rect x="50" y="70" width="500" height="660" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
  </g>

  <text x="90" y="180" fill="white" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="40" font-weight="800">
    ${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </text>

  ${safeAuthor ? `
  <text x="90" y="240" fill="rgba(255,255,255,0.85)" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="24" font-weight="600">
    ${safeAuthor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </text>
  ` : ''}

  <text x="90" y="700" fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="18" font-weight="600">
    Book Digest
  </text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function OptimizedBookCover({ src, alt, author, bookId, className = '', priority = false }: OptimizedBookCoverProps) {
  const aiCoverSrc = bookId ? `/ai-covers/${bookId}.svg` : null;
  const generatedCoverSrc = makeGeneratedCoverDataUri(alt, author);
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // IMPORTANT:
  // For external cover hosts (OpenLibrary, Google Books, etc.), Next/Image optimization can be flaky in production
  // due to cold starts, rate limiting, or edge fetch failures from Vercel's optimizer.
  // Using `unoptimized` forces the browser to fetch the remote image directly, which is typically far more stable.
  const isRemoteSrc = typeof imgSrc === 'string' && /^https?:\/\//.test(imgSrc);
  const shouldUnoptimize = isRemoteSrc || hasError;

  // Smart improvement: Google Books covers sometimes return a real image that says "Image not available".
  // In that case onError never fires. For Google Books covers, prefer our local AI cover *only if it exists*.
  useEffect(() => {
    if (!aiCoverSrc) return;
    const isGoogleBooks = typeof src === 'string' && src.includes('books.google.com');
    if (!isGoogleBooks) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(aiCoverSrc, { method: 'HEAD' });
        if (!cancelled && res.ok) {
          setImgSrc(aiCoverSrc);
          setIsLoading(true);
          setHasError(false);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [aiCoverSrc, src]);

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

    // Second failure: fallback to local AI cover if available
    if (aiCoverSrc) {
      setImgSrc(aiCoverSrc);
      setHasError(true);
      setIsLoading(true);
      return;
    }

    // Final fallback: generated SVG cover (always available)
    setImgSrc(generatedCoverSrc);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Use a plain <img> tag for maximum reliability.
          Next/Image optimization (and even unoptimized mode) can still behave inconsistently
          across browsers/CDNs for external image hosts and data-URI fallbacks. */}
      <img
        src={imgSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleError}
        onLoad={handleLoad}
        referrerPolicy="no-referrer"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}
      
    </div>
  );
}
