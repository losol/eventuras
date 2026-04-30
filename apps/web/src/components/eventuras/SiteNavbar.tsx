import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';

import UserMenu from '@/components/eventuras/UserMenu';
import getSiteSettings from '@/utils/site/getSiteSettings';

export type SiteNavbarVariant = 'primary' | 'transparent' | 'dark';

export interface SiteNavbarProps {
  variant?: SiteNavbarVariant;
  /** Override the brand label. Defaults to `site.name`. */
  title?: string;
  sticky?: boolean;
}

const BG_COLOR_BY_VARIANT: Record<Exclude<SiteNavbarVariant, 'dark'>, string> = {
  primary: 'bg-primary w-full py-1',
  transparent: 'bg-transparent w-full py-1',
};

export default async function SiteNavbar({
  variant = 'transparent',
  title,
  sticky,
}: Readonly<SiteNavbarProps>) {
  const site = await getSiteSettings();
  const t = await getTranslations();

  const brand = title ?? site?.name ?? 'Eventuras';
  const isDark = variant === 'dark';

  return (
    <Navbar
      {...(isDark
        ? { dark: true, overlay: true, glass: true }
        : { bgColor: BG_COLOR_BY_VARIANT[variant], sticky })}
    >
      <Navbar.Brand>
        <Link href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
          {brand}
        </Link>
      </Navbar.Brand>
      <Navbar.Content className="justify-end">
        <UserMenu
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
      </Navbar.Content>
    </Navbar>
  );
}
