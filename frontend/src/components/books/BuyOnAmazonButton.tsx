'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface BuyOnAmazonButtonProps {
  amazonLinkUS?: string;
  amazonLinkUK?: string;
  amazonLinkDE?: string;
  amazonLinkES?: string;
  amazonLinkFR?: string;
  amazonLinkIT?: string;
  bookTitle: string;
  className?: string;
}

export function BuyOnAmazonButton({
  amazonLinkUS,
  amazonLinkUK,
  amazonLinkDE,
  amazonLinkES,
  amazonLinkFR,
  amazonLinkIT,
  bookTitle,
  className = '',
}: BuyOnAmazonButtonProps) {
  const [selectedRegion, setSelectedRegion] = useState<'US' | 'UK' | 'DE' | 'ES' | 'FR' | 'IT'>('US');
  const [showDropdown, setShowDropdown] = useState(false);

  // Detect user's region based on browser locale
  useEffect(() => {
    const locale = navigator.language.toLowerCase();
    if (locale.includes('de')) {
      setSelectedRegion('DE');
    } else if (locale.includes('es')) {
      setSelectedRegion('ES');
    } else if (locale.includes('fr')) {
      setSelectedRegion('FR');
    } else if (locale.includes('it')) {
      setSelectedRegion('IT');
    } else if (locale.includes('gb') || locale.includes('en-gb')) {
      setSelectedRegion('UK');
    } else {
      setSelectedRegion('US');
    }
  }, []);

  const getCurrentLink = () => {
    if (selectedRegion === 'UK' && amazonLinkUK) return amazonLinkUK;
    if (selectedRegion === 'DE' && amazonLinkDE) return amazonLinkDE;
    if (selectedRegion === 'ES' && amazonLinkES) return amazonLinkES;
    if (selectedRegion === 'FR' && amazonLinkFR) return amazonLinkFR;
    if (selectedRegion === 'IT' && amazonLinkIT) return amazonLinkIT;
    return amazonLinkUS || amazonLinkUK || amazonLinkDE || amazonLinkES || amazonLinkFR || amazonLinkIT || '#';
  };

  const getRegionLabel = () => {
    if (selectedRegion === 'UK') return '🇬🇧 Amazon.co.uk';
    if (selectedRegion === 'DE') return '🇩🇪 Amazon.de';
    if (selectedRegion === 'ES') return '🇪🇸 Amazon.es';
    if (selectedRegion === 'FR') return '🇫🇷 Amazon.fr';
    if (selectedRegion === 'IT') return '🇮🇹 Amazon.it';
    return '🇺🇸 Amazon.com';
  };

  return (
    <div className="relative inline-block">
      <div className="flex gap-2">
        <a
          href={getCurrentLink()}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`
            flex items-center justify-center gap-2 px-6 py-3
            bg-gradient-to-r from-yellow-400 to-yellow-500
            hover:from-yellow-500 hover:to-yellow-600
            text-gray-900 font-semibold rounded-lg
            shadow-lg hover:shadow-xl
            transition-all duration-200
            transform hover:scale-105
            ${className}
          `}
          onClick={() => {
            // Track affiliate click (optional - add analytics)
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'affiliate_click', {
                book_title: bookTitle,
                region: selectedRegion,
              });
            }
          }}
        >
          <span>Buy on Amazon</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Region Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="
              px-4 py-3 bg-white dark:bg-gray-800
              border-2 border-gray-300 dark:border-gray-600
              rounded-lg hover:border-yellow-400
              transition-colors font-medium
            "
            aria-label="Select Amazon region"
          >
            {getRegionLabel()}
          </button>

          {showDropdown && (
            <div className="
              absolute right-0 mt-2 w-48
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-xl z-10
            ">
              {amazonLinkUS && (
                <button
                  onClick={() => {
                    setSelectedRegion('US');
                    setShowDropdown(false);
                  }}
                  className="
                    w-full px-4 py-2 text-left
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    first:rounded-t-lg
                  "
                >
                  🇺🇸 Amazon.com
                </button>
              )}
              {amazonLinkUK && (
                <button
                  onClick={() => {
                    setSelectedRegion('UK');
                    setShowDropdown(false);
                  }}
                  className="
                    w-full px-4 py-2 text-left
                    hover:bg-gray-100 dark:hover:bg-gray-700
                  "
                >
                  🇬🇧 Amazon.co.uk
                </button>
              )}
              {amazonLinkDE && (
                <button
                  onClick={() => {
                    setSelectedRegion('DE');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🇩🇪 Amazon.de
                </button>
              )}
              {amazonLinkES && (
                <button
                  onClick={() => {
                    setSelectedRegion('ES');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🇪🇸 Amazon.es
                </button>
              )}
              {amazonLinkFR && (
                <button
                  onClick={() => {
                    setSelectedRegion('FR');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🇫🇷 Amazon.fr
                </button>
              )}
              {amazonLinkIT && (
                <button
                  onClick={() => {
                    setSelectedRegion('IT');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                >
                  🇮🇹 Amazon.it
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </div>
  );
}
