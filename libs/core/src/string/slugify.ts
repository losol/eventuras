/**
 * Convert a string to a URL-friendly slug.
 *
 * Handles Nordic characters (æ, ø, å, ä, ö), Unicode normalization,
 * diacritics removal, and general slug formatting.
 *
 * @param str - The string to slugify
 * @returns A lowercase, hyphenated slug safe for URLs
 *
 * @example
 * ```ts
 * slugify('Helseministerens plan') // 'helseministerens-plan'
 * slugify('Blåbærøl og Ål') // 'blaberol-og-al'
 * ```
 */
const slugify = (str: string): string => {
  if (!str) return '';

  str = str.toLowerCase();

  // Nordic character conversions: source characters → target replacement
  const conversions: Record<string, string> = {
    e: 'æ|ä',
    o: 'ø|ö',
    a: 'å',
  };

  for (const [target, sources] of Object.entries(conversions)) {
    str = str.replace(new RegExp(sources, 'g'), target);
  }

  return str
    .normalize('NFKD') // Normalize Unicode characters
    .replace(/\p{Diacritic}/gu, '') // Remove diacritic marks
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
    .toLowerCase(); // Ensure lowercase
};

export { slugify };
