export function generateBookSlug(title: string, id: string): string {
  // Convert to lowercase and replace special characters/spaces with hyphens
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
  
  return `${cleanTitle}-summary-${id}`;
}
