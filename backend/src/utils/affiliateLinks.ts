// Amazon Affiliate Link Generator

export const AFFILIATE_IDS = {
  US: 'bookdigest06-20',
  UK: 'bookdigest-21',
  DE: 'bookdigest-21',
};

export const AMAZON_DOMAINS = {
  US: 'amazon.com',
  UK: 'amazon.co.uk',
  DE: 'amazon.de',
};

/**
 * Generate Amazon affiliate link for a book
 * @param title - Book title
 * @param author - Book author
 * @param isbn - ISBN (optional, but preferred)
 * @param region - Amazon region (US, UK, DE)
 */
export function generateAffiliateLink(
  title: string,
  author: string,
  isbn?: string,
  region: 'US' | 'UK' | 'DE' = 'US'
): string {
  const affiliateId = AFFILIATE_IDS[region];
  const domain = AMAZON_DOMAINS[region];

  // If we have ISBN, use it for direct product link
  if (isbn) {
    const cleanIsbn = isbn.replace(/[^0-9X]/g, '');
    return `https://www.${domain}/dp/${cleanIsbn}?tag=${affiliateId}`;
  }

  // Otherwise, use search link with title and author
  const searchQuery = encodeURIComponent(`${title} ${author}`);
  return `https://www.${domain}/s?k=${searchQuery}&tag=${affiliateId}`;
}

/**
 * Detect user's region based on various factors
 * This will be used on the frontend
 */
export function getDefaultRegion(): 'US' | 'UK' | 'DE' {
  // Server-side: default to US
  // Client-side will detect based on browser locale/IP
  return 'US';
}

/**
 * Generate affiliate links for all regions
 */
export function generateAllAffiliateLinks(
  title: string,
  author: string,
  isbn?: string
) {
  return {
    US: generateAffiliateLink(title, author, isbn, 'US'),
    UK: generateAffiliateLink(title, author, isbn, 'UK'),
    DE: generateAffiliateLink(title, author, isbn, 'DE'),
  };
}
