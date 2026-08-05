import { getTranslations } from 'next-intl/server';

import SiteNavbarClient from '@/components/eventuras/SiteNavbarClient';
import getSiteSettings from '@/utils/site/getSiteSettings';

export type SiteNavbarVariant = 'primary' | 'transparent' | 'dark';

export interface SiteNavbarProps {
  variant?: SiteNavbarVariant;
  /** Override the brand label. Defaults to `site.name`. */
  title?: string;
  sticky?: boolean;
}

/**
 * Server half of the site navbar: fetches site settings and translations,
 * then hands plain props to `SiteNavbarClient`, which owns all Navbar
 * compound-component rendering (see the note there for why the split exists).
 */
export default async function SiteNavbar({
  variant = 'transparent',
  title,
  sticky,
}: Readonly<SiteNavbarProps>) {
  const site = await getSiteSettings();
  const t = await getTranslations();

  const brand = title ?? site?.name ?? 'Eventuras';

  return (
    <SiteNavbarClient
      brand={brand}
      variant={variant}
      sticky={sticky}
      translations={{
        loginLabel: t('common.labels.login'),
        accountLabel: t('common.labels.account'),
        adminLabel: t('common.labels.admin'),
        userLabel: t('common.labels.user'),
        logoutLabel: t('common.labels.logout'),
        loggingOutLabel: t('common.labels.loggingOut'),
        lightThemeLabel: t('common.labels.lightTheme'),
        darkThemeLabel: t('common.labels.darkTheme'),
      }}
    />
  );
}
