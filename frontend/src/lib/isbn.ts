/**
 * ISBN utilities — convert ISBN-13 to ISBN-10 (Amazon's ASIN format for books).
 * Mirrors backend/src/utils/isbn.ts.
 */

export function cleanIsbn(isbn: string | null | undefined): string {
  if (!isbn) return '';
  return isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
}

export function isbn13ToIsbn10(isbn13: string): string | null {
  const clean = cleanIsbn(isbn13);
  if (clean.length !== 13 || !clean.startsWith('978')) return null;

  const core = clean.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i], 10) * (10 - i);
  }
  const checkVal = (11 - (sum % 11)) % 11;
  const checkChar = checkVal === 10 ? 'X' : String(checkVal);
  return core + checkChar;
}

export function toAmazonAsin(isbn: string | null | undefined): string | null {
  const clean = cleanIsbn(isbn);
  if (clean.length === 10) return clean;
  if (clean.length === 13) return isbn13ToIsbn10(clean);
  return null;
}
