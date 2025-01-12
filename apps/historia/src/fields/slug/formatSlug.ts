import type { FieldHook } from 'payload';

export const formatSlug = (val: string): string => {
  if (!val) return '';

  val = val.toLowerCase();

  // Define character conversions
  const conversions: { [key: string]: string; } = {
    e: 'æ|ä',
    o: 'ø|ö',
    a: 'å',
  };

  // Replace Norwegian and other special characters
  for (const key in conversions) {
    if (Object.hasOwn(conversions, key)) {
      const re = new RegExp(conversions[key]!, 'gi'); // Case-insensitive
      val = val.replace(re, key);
    }
  }

  // Final formatting (spaces to hyphens, remove invalid characters, lowercase)
  return val
    .normalize('NFKD') // Normalize Unicode characters
    .replace(/\p{Diacritic}/gu, '') // Remove diacritic marks
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
};

export const formatSlugHook =
  (fallback: string): FieldHook =>
    ({ data, operation, originalDoc, value }) => {
      if (typeof value === 'string') {
        return formatSlug(value);
      }

      // If creating or no existing slug, fallback to another field
      if (operation === 'create' || !data?.slug) {
        const fallbackData = data?.[fallback];

        if (fallbackData && typeof fallbackData === 'string') {
          return formatSlug(fallbackData);
        }
      }

      return value;
    };
