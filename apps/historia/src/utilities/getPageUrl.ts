/**
 * Generates a locale-prefixed URL for a page.
 *
 * @param slug - The page slug (without leading slash)
 * @param locale - The locale code (e.g., 'no', 'en', 'nb'). If not provided, uses NEXT_PUBLIC_CMS_DEFAULT_LOCALE.
 * @returns The locale-prefixed URL path (e.g., '/no/about')
 *
 * @example
 * ```ts
 * getPageUrl('about', 'no') // '/no/about'
 * getPageUrl('products/widget') // '/nb/products/widget' (uses default locale)
 * getPageUrl('/about', 'en') // '/en/about' (handles leading slash)
 * ```
 */
export function getPageUrl(slug: string, locale?: string): string {
  // Get default locale from environment if not provided
  const effectiveLocale = locale || process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no';

  // Remove leading slash from slug if present
  const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;

  // Return empty string for empty slugs
  if (!cleanSlug) {
    return `/${effectiveLocale}`;
  }

  return `/${effectiveLocale}/${cleanSlug}`;
}
