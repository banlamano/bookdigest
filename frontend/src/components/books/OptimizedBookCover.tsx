'use client';

import { useEffect, useMemo, useState } from 'react';

interface OptimizedBookCoverProps {
  src?: string | null;
  title: string;
  author?: string;
  className?: string;
  priority?: boolean;
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function clampText(s: string, max: number) {
  const t = (s || '').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function hashToHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

function makeCoverDataUri(title: string, author?: string) {
  const t = escapeXml(clampText(title || 'Untitled', 40));
  const a = author ? escapeXml(clampText(author, 40)) : '';
  const hue1 = hashToHue(`${title}|${author || ''}`);
  const hue2 = (hue1 + 50) % 360;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1} 70% 45%)"/>
      <stop offset="100%" stop-color="hsl(${hue2} 70% 35%)"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <rect x="50" y="70" width="500" height="660" rx="26" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.20)"/>
  <text x="90" y="190" fill="white" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" font-size="40" font-weight="800">${t}</text>
  ${a ? `<text x="90" y="245" fill="rgba(255,255,255,0.85)" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" font-size="24" font-weight="600">${a}</text>` : ''}
  <text x="90" y="705" fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" font-size="18" font-weight="600">Book Digest</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function OptimizedBookCover({ src, title, author, className = '', priority = false }: OptimizedBookCoverProps) {
  const generatedCover = useMemo(() => makeCoverDataUri(title, author), [title, author]);

  // Initialize with a non-empty src so we never render a blank cover.
  const [imgSrc, setImgSrc] = useState<string>(() => (src && String(src).trim().length > 0 ? String(src) : generatedCover));

  useEffect(() => {
    const next = src && String(src).trim().length > 0 ? String(src) : generatedCover;
    setImgSrc(next);
  }, [src, generatedCover]);

  const handleError = () => {
    // Single, stable fallback (no retries, no blinking)
    setImgSrc(generatedCover);
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={imgSrc}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
