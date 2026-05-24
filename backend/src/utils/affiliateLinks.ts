// Amazon Affiliate Link Generator
import { toAmazonAsin } from './isbn';

export const AFFILIATE_IDS = {
  US: 'bookdigest06-20',
  UK: 'bookdigest06-20',
  DE: 'bookdigestde-21',
  ES: 'bookdigest-21',
  FR: 'bookdigest-21',
  IT: 'bookdigest-21',
};

export const AMAZON_DOMAINS = {
  US: 'amazon.com',
  UK: 'amazon.co.uk',
  DE: 'amazon.de',
  ES: 'amazon.es',
  FR: 'amazon.fr',
  IT: 'amazon.it',
};

export type AmazonRegion = keyof typeof AFFILIATE_IDS;

/**
 * Generate an Amazon affiliate link for a book.
 *
 * Prefers a direct /dp/{ASIN} product page (4–6× higher conversion than
 * search results, per affiliate marketing benchmarks). Falls back to a
 * title+author search URL only when no ISBN is available.
 */
export function generateAffiliateLink(
  title: string,
  author: string,
  isbn?: string | null,
  region: AmazonRegion = 'US'
): string {
  const affiliateId = AFFILIATE_IDS[region];
  const domain = AMAZON_DOMAINS[region];

  const asin = toAmazonAsin(isbn);
  if (asin) {
    return `https://www.${domain}/dp/${asin}?tag=${affiliateId}`;
  }

  // No ISBN → search fallback
  const query = encodeURIComponent(`${title} ${author}`.trim());
  return `https://www.${domain}/s?k=${query}&tag=${affiliateId}`;
}

export function getDefaultRegion(): AmazonRegion {
  return 'US';
}

export function generateAllAffiliateLinks(
  title: string,
  author: string,
  isbn?: string | null
) {
  return {
    US: generateAffiliateLink(title, author, isbn, 'US'),
    UK: generateAffiliateLink(title, author, isbn, 'UK'),
    DE: generateAffiliateLink(title, author, isbn, 'DE'),
    ES: generateAffiliateLink(title, author, isbn, 'ES'),
    FR: generateAffiliateLink(title, author, isbn, 'FR'),
    IT: generateAffiliateLink(title, author, isbn, 'IT'),
  };
}
