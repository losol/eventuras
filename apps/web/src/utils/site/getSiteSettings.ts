import { Logger } from '@eventuras/logger';

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
}

/**
 * Fetches site settings from the configured URL.
 * Uses Next.js fetch caching with 10-minute revalidation.
 *
 * @returns Site information or null if not configured or fetch fails
 */
const getSiteSettings = async (): Promise<SiteInfo | null> => {
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
    return data.site;
  } catch (error) {
    logger.error({ error, url: siteSettingsUrl }, 'Failed to fetch site settings');
    return null;
  }
};

export default getSiteSettings;
