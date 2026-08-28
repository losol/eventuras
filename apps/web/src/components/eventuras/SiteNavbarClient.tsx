'use client';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';
import { Link } from '@eventuras/ratio-ui-next/Link';

import UserMenu, { type UserMenuTranslations } from '@/components/eventuras/UserMenu';

import type { SiteNavbarVariant } from './SiteNavbar';

const BG_COLOR_BY_VARIANT: Record<Exclude<SiteNavbarVariant, 'dark'>, string> = {
  primary: 'bg-primary w-full py-1',
  transparent: 'bg-transparent w-full py-1',
};
// A sticky bar needs a surface behind it, and a known height (h-16 = 16 spacing
// units) so page-level sticky elements (e.g. the event section nav) can sit right under it.
const STICKY_TRANSPARENT_BG = 'bg-surface border-b border-border-1 w-full';
const STICKY_CLASSES = 'h-16 flex items-center';

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
        : {
            bgColor:
              sticky && variant === 'transparent'
                ? STICKY_TRANSPARENT_BG
                : BG_COLOR_BY_VARIANT[variant],
            sticky,
            className: sticky ? STICKY_CLASSES : undefined,
          })}
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
