'use client';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';
import { Link } from '@eventuras/ratio-ui-next/Link';

import UserMenu, { type UserMenuTranslations } from '@/components/eventuras/UserMenu';

import type { SiteNavbarVariant } from './SiteNavbar';

const BG_COLOR_BY_VARIANT: Record<Exclude<SiteNavbarVariant, 'dark'>, string> = {
  primary: 'bg-primary w-full py-1',
  transparent: 'bg-transparent w-full py-1',
};

export interface SiteNavbarClientProps {
  brand: string;
  variant: SiteNavbarVariant;
  sticky?: boolean;
  translations: UserMenuTranslations;
}

/**
 * Client half of the site navbar. Navbar ships as a `use client` module since
 * ratio-ui 2.14, so its compound statics (`Navbar.Brand`, `Navbar.Content`)
 * only exist inside the client bundle — a server component dotting into them
 * gets `undefined` from the client-reference proxy. The server half
 * (`SiteNavbar`) fetches data and passes plain props across the boundary.
 */
export default function SiteNavbarClient({
  brand,
  variant,
  sticky,
  translations,
}: Readonly<SiteNavbarClientProps>) {
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
        <UserMenu translations={translations} />
      </Navbar.Content>
    </Navbar>
  );
}
