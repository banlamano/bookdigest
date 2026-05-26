'use client';

import { useEffect, useState } from 'react';
import { Headphones, ExternalLink } from 'lucide-react';

interface ListenOnAudibleButtonProps {
  bookTitle: string;
  bookAuthor?: string;
  className?: string;
}

// Audible regional sites. Amazon Associates tags work for Audible too —
// US site uses the US Amazon tag, DE site uses the DE tag, etc.
const AUDIBLE_REGIONS = {
  US: { domain: 'audible.com', tag: 'bookdigest06-20' },
  UK: { domain: 'audible.co.uk', tag: 'bookdigest06-20' },
  DE: { domain: 'audible.de', tag: 'bookdigestde-21' },
  FR: { domain: 'audible.fr', tag: 'bookdigest-21' },
  IT: { domain: 'audible.it', tag: 'bookdigest-21' },
} as const;

type AudibleRegion = keyof typeof AUDIBLE_REGIONS;

function detectRegion(): AudibleRegion {
  if (typeof navigator === 'undefined') return 'US';
  const locale = navigator.language.toLowerCase();
  if (locale.startsWith('de')) return 'DE';
  if (locale.startsWith('fr')) return 'FR';
  if (locale.startsWith('it')) return 'IT';
  if (locale.includes('gb')) return 'UK';
  return 'US';
}

function buildAudibleSearchUrl(region: AudibleRegion, title: string, author?: string) {
  const { domain, tag } = AUDIBLE_REGIONS[region];
  const query = encodeURIComponent(`${title} ${author || ''}`.trim());
  return `https://www.${domain}/search?keywords=${query}&tag=${tag}`;
}

export function ListenOnAudibleButton({ bookTitle, bookAuthor, className = '' }: ListenOnAudibleButtonProps) {
  const [region, setRegion] = useState<AudibleRegion>('US');

  useEffect(() => {
    setRegion(detectRegion());
  }, []);

  const href = buildAudibleSearchUrl(region, bookTitle, bookAuthor);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'affiliate_click', {
            book_title: bookTitle,
            partner: 'audible',
            region,
          });
        }
      }}
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-3
        bg-gray-900 hover:bg-black
        text-white font-semibold rounded-lg
        shadow-lg hover:shadow-xl
        transition-all duration-200
        transform hover:scale-105
        ${className}
      `}
    >
      <Headphones className="w-4 h-4 text-[#F69323]" />
      <span>Listen on Audible</span>
      <ExternalLink className="w-4 h-4 opacity-70" />
    </a>
  );
}
