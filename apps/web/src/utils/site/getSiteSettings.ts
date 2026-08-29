import { cache } from 'react';

import { Logger } from '@eventuras/logger';

import {
  type ColorScheme,
  isColorScheme,
  isSlug,
  type OccasionsConfig,
  parseOccasions,
} from '@/utils/site/occasions';

const logger = Logger.create({
  namespace: 'web:utils:site',
  context: { module: 'getSiteSettings' },
});

export interface FooterLink {
  text: string;
  href: string;
}

export interface FeaturedImage {
  src: string;
  alt: string;
  caption: string;
}

export interface SupportContact {
  name: string;
  email: string;
}

export interface Publisher {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface SiteInfo {
  name: string;
  description: string;
  frontpage: {
    title: string;
    introduction: string;
    featuredImage: FeaturedImage;
  };
  footerLinks: FooterLink[];
  publisher: Publisher;
  contactInformation: {
    support: SupportContact;
  };
  /** Short-lived markings and announcements; see `occasions.ts`. Invalid entries are dropped. */
  occasions?: OccasionsConfig | null;
  /** Named ratio-ui palette for the whole site (`data-theme`). Absent = standard. */
  theme?: string | null;
  /** Always-on colour scheme for the site; the user's toggle is hidden. Absent = user's choice. */
  colorScheme?: ColorScheme | null;
}

/**
 * Fetches site settings from the configured URL.
 * Uses Next.js fetch caching with 10-minute revalidation, and is memoized per
 * request with React `cache()` so metadata, layouts and the navbar share one
 * call (and one pair of log lines) per render.
 *
 * @returns Site information or null if not configured or fetch fails
 */
const getSiteSettings = cache(async (): Promise<SiteInfo | null> => {
  const siteSettingsUrl = process.env.SITE_SETTINGS_URL;

  if (!siteSettingsUrl) {
    logger.debug('SITE_SETTINGS_URL not configured');
    return null;
  }

  try {
    logger.info({ url: siteSettingsUrl }, 'Fetching site settings');

    const res = await fetch(siteSettingsUrl, {
      next: { revalidate: 600 }, // Revalidate every 10 minutes
    });

    if (!res.ok) {
      logger.error(
        { status: res.status, statusText: res.statusText, url: siteSettingsUrl },
        'Failed to fetch site settings - bad response'
      );
      return null;
    }

    const data = await res.json();

    if (!data?.site) {
      logger.error({ data }, 'Site settings response missing site property');
      return null;
    }

    logger.info('Site settings fetched successfully');
    const occasions = parseOccasions(data.site.occasions, (path, reason) =>
      logger.warn({ path, reason }, 'Ignoring invalid occasions entry in site settings')
    );
    let theme: string | null = null;
    if (data.site.theme != null) {
      if (isSlug(data.site.theme)) theme = data.site.theme;
      else logger.warn({ value: data.site.theme }, 'Ignoring invalid site theme');
    }
    let colorScheme: ColorScheme | null = null;
    if (data.site.colorScheme != null) {
      if (isColorScheme(data.site.colorScheme)) colorScheme = data.site.colorScheme;
      else logger.warn({ value: data.site.colorScheme }, 'Ignoring invalid site colorScheme');
    }
    return { ...data.site, occasions, theme, colorScheme };
  } catch (error) {
    logger.error({ error, url: siteSettingsUrl }, 'Failed to fetch site settings');
    return null;
  }
});

export default getSiteSettings;
