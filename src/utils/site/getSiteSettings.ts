import Environment from '@/utils/Environment';

import Logger from '../Logger';

interface FeaturedImage {
  src: string;
  alt: string;
  caption: string;
}

interface FooterLink {
  text: string;
  href: string;
}

interface SiteInfo {
  name: string;
  description: string;
  frontpage: {
    title: string;
    introduction: string;
    featuredImage: FeaturedImage;
  };
  footerLinks: FooterLink[];
}

const getSiteSettings = async (): Promise<SiteInfo | null> => {
  if (Environment.NEXT_PUBLIC_SITE_SETTINGS_URL) {
    try {
      const res = await fetch(Environment.NEXT_PUBLIC_SITE_SETTINGS_URL);
      const data = await res.json();
      return data.site;
    } catch (error) {
      Logger.error({ namespace: 'sitesettings' }, 'Failed to fetch site settings:');
      return null;
    }
  } else {
    return null;
  }
};

export default getSiteSettings;
