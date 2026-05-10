export function generateBookSlug(title: string, id: string, language: string = 'en'): string {
  let cleanTitle = title.toLowerCase();

  // Transliterate German umlauts before removing special chars
  cleanTitle = cleanTitle
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

  // Convert to lowercase and replace special characters/spaces with hyphens
  cleanTitle = cleanTitle
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
  
  const summaryWord = language === 'de' ? 'zusammenfassung' : 'summary';
  return `${cleanTitle}-${summaryWord}-${id}`;
}
