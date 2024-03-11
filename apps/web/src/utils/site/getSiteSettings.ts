import { FooterLink } from '@eventuras/ui/Footer';

import Environment from '@/utils/Environment';

import Logger from '../Logger';

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

const getSiteSettings = async (): Promise<SiteInfo | null> => {
  if (Environment.NEXT_PUBLIC_SITE_SETTINGS_URL) {
    try {
      const res = await fetch(Environment.NEXT_PUBLIC_SITE_SETTINGS_URL, {
        next: { revalidate: 600 },
      });
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
