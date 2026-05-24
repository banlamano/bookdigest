/**
 * ISBN utilities — convert ISBN-13 to ISBN-10 (Amazon's ASIN format for books).
 *
 * Amazon's /dp/{ASIN} URLs need a 10-character ASIN. For physical books the
 * ASIN equals the ISBN-10. Most modern books only carry ISBN-13, so we have
 * to recompute the check digit.
 */

/** Strip dashes/spaces and return only valid ISBN characters. */
export function cleanIsbn(isbn: string | null | undefined): string {
  if (!isbn) return '';
  return isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
}

/**
 * Convert ISBN-13 (starting with 978) to ISBN-10. Returns null if input
 * isn't a recognizable ISBN-13. Bookland 979 prefix has no ISBN-10 mapping.
 */
export function isbn13ToIsbn10(isbn13: string): string | null {
  const clean = cleanIsbn(isbn13);
  if (clean.length !== 13 || !clean.startsWith('978')) return null;

  const core = clean.slice(3, 12); // 9 digits after "978", before old check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i], 10) * (10 - i);
  }
  const checkVal = (11 - (sum % 11)) % 11;
  const checkChar = checkVal === 10 ? 'X' : String(checkVal);
  return core + checkChar;
}

/**
 * Return the best ASIN candidate for an Amazon /dp/ URL.
 * - ISBN-10 → returned as-is
 * - ISBN-13 starting with 978 → converted to ISBN-10
 * - Otherwise → null
 */
export function toAmazonAsin(isbn: string | null | undefined): string | null {
  const clean = cleanIsbn(isbn);
  if (clean.length === 10) return clean;
  if (clean.length === 13) return isbn13ToIsbn10(clean);
  return null;
}
