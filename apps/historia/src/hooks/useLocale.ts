'use client';

import { usePathname } from 'next/navigation';

import { publicEnv } from '@/config.client';

/**
 * Extract the current locale from the pathname.
 *
 * @param defaultLocale - Optional fallback locale. If not provided, uses NEXT_PUBLIC_CMS_DEFAULT_LOCALE from environment.
 * @returns The current locale code (e.g., 'no', 'en', 'nb')
 *
 * @example
 * ```tsx
 * const locale = useLocale(); // Uses env default
 * const locale = useLocale('en'); // Custom default
 * ```
 */
export function useLocale(defaultLocale?: string): string {
  const pathname = usePathname();
  const envDefaultLocale = publicEnv.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no';

  // For the root path (`'/'`), `pathname.split('/')[1]` is `''`/`undefined`,
  // so we intentionally rely on the fallback chain (`defaultLocale` → `envDefaultLocale`).
  const localeSegment = pathname?.split('/')[1];

  return localeSegment || defaultLocale || envDefaultLocale;
}
