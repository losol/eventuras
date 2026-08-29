import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { InitSentry } from '@/providers/sentry';
import { InitTheme } from '@/providers/theme';
import getSiteSettings from '@/utils/site/getSiteSettings';
import { resolveOccasion } from '@/utils/site/occasions';

import Providers from './Providers';

import '@eventuras/ratio-ui/ratio-ui.css';
import '@eventuras/ratio-ui/fonts.css';

// getSiteSettings is memoized per request, so this and the layout below share
// one call and follow the same 10-minute revalidation instead of a one-off
// read at startup.
export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    title: {
      template: `%s | ${siteSettings?.name ?? 'Eventuras'}`,
      default: siteSettings?.name ?? 'Eventuras',
    },
    description: siteSettings?.description ?? 'A life with eventuras',
  };
}

/**
 * Root Layout - Minimal wrapper providing html/body structure
 * Actual navbar/footer are in route group layouts.
 * The active occasion (mourning, Pride, …) rides on <html> next to the theme
 * for the app's [data-occasion] CSS and ratio-ui's chrome hooks; mourning also
 * flips ratio-ui's data-motion="none" switch (stillness is the device). Theming is
 * two axes: data-theme is the palette (a named ratio-ui theme from the
 * occasion or the site; absent = standard) and data-color-scheme is
 * light/dark — the user's stored choice, unless the occasion or the site
 * forces one, in which case it is rendered here and the client leaves it alone.
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const site = await getSiteSettings();
  const occasion = resolveOccasion(site?.occasions);
  const theme = occasion?.theme ?? site?.theme ?? null;
  const forcedColorScheme = occasion?.colorScheme ?? site?.colorScheme ?? null;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-theme={theme ?? undefined}
      data-color-scheme={forcedColorScheme ?? undefined}
      data-occasion={occasion?.id}
      data-motion={occasion?.id === 'mourning' ? 'none' : undefined}
    >
      <head>
        <InitSentry />
        <InitTheme forced={forcedColorScheme} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers forcedColorScheme={forcedColorScheme}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
