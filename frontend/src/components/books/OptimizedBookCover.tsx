'use client';

import { useEffect, useMemo, useState } from 'react';

interface OptimizedBookCoverProps {
  src?: string | null;
  title: string;
  author?: string;
  language?: string;
  className?: string;
  priority?: boolean;
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function hashToHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Split text into lines that fit within a max character width. */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  // Limit to 4 lines max, add ellipsis if truncated
  if (lines.length > 4) {
    lines.length = 4;
    lines[3] = lines[3].slice(0, -1) + '…';
  }
  return lines;
}

function makeCoverDataUri(title: string, author?: string) {
  const safeTitle = (title || 'Untitled').trim();
  const safeAuthor = (author || '').trim();
  const hue1 = hashToHue(`${safeTitle}|${safeAuthor}`);
  const hue2 = (hue1 + 40) % 360;
  const hue3 = (hue1 + 160) % 360;

  // Wrap title into multiple lines
  const titleLines = wrapText(safeTitle, 20);
  const titleFontSize = titleLines.length > 2 ? 36 : 42;
  const titleLineHeight = titleFontSize * 1.25;
  const titleStartY = 220;

  const titleSvg = titleLines
    .map((line, i) => `<text x="80" y="${titleStartY + i * titleLineHeight}" fill="white" font-family="'Georgia','Times New Roman',serif" font-size="${titleFontSize}" font-weight="700" letter-spacing="-0.5">${escapeXml(line)}</text>`)
    .join('\n  ');

  // Author positioned below title
  const authorY = titleStartY + titleLines.length * titleLineHeight + 16;
  const authorSvg = safeAuthor
    ? `<text x="80" y="${authorY}" fill="rgba(255,255,255,0.8)" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="22" font-weight="500" letter-spacing="0.5">${escapeXml(safeAuthor)}</text>`
    : '';

  // Decorative accent line under title
  const accentY = authorY + (safeAuthor ? 28 : -8);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1} 55% 30%)"/>
      <stop offset="50%" stop-color="hsl(${hue2} 60% 22%)"/>
      <stop offset="100%" stop-color="hsl(${hue1} 50% 15%)"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="hsl(${hue3} 70% 65%)"/>
      <stop offset="100%" stop-color="hsl(${hue3} 70% 65%)" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="600" height="800" fill="url(#bg)"/>
  <!-- Subtle texture pattern -->
  <rect x="0" y="0" width="600" height="400" fill="url(#shine)"/>
  <!-- Spine shadow -->
  <rect x="0" y="0" width="28" height="800" fill="rgba(0,0,0,0.25)"/>
  <rect x="28" y="0" width="3" height="800" fill="rgba(255,255,255,0.08)"/>
  <!-- Top decorative bar -->
  <rect x="80" y="100" width="60" height="5" rx="2.5" fill="hsl(${hue3} 70% 65%)" opacity="0.9"/>
  <!-- Title -->
  ${titleSvg}
  <!-- Author -->
  ${authorSvg}
  <!-- Accent line -->
  <rect x="80" y="${accentY}" width="180" height="2" rx="1" fill="url(#accent)"/>
  <!-- Bottom branding -->
  <rect x="80" y="690" width="440" height="1" fill="rgba(255,255,255,0.12)"/>
  <text x="80" y="725" fill="rgba(255,255,255,0.55)" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="16" font-weight="600" letter-spacing="3">BOOK DIGEST</text>
  <!-- Corner accent -->
  <rect x="500" y="100" width="5" height="40" rx="2.5" fill="hsl(${hue3} 70% 65%)" opacity="0.4"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function OptimizedBookCover({ src, title, author, language, className = '', priority = false }: OptimizedBookCoverProps) {
  const generatedCover = useMemo(() => makeCoverDataUri(title, author), [title, author]);

  // For non-English books, always use generated covers (external covers show English editions)
  const useGenerated = language && language !== 'en';

  // Initialize with a non-empty src so we never render a blank cover.
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (useGenerated) return generatedCover;
    return src && String(src).trim().length > 0 ? String(src) : generatedCover;
  });

  useEffect(() => {
    if (useGenerated) {
      setImgSrc(generatedCover);
      return;
    }
    const next = src && String(src).trim().length > 0 ? String(src) : generatedCover;
    setImgSrc(next);
  }, [src, generatedCover, useGenerated]);

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

