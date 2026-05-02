import Link from 'next/link';

import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';

import getSiteSettings from '@/utils/site/getSiteSettings';

/**
 * Shared site footer used by every route group layout. Renders the
 * canonical dark `Footer.Classic` with the site's name + publisher
 * block on the left and the configured footer links on the right.
 *
 * Centralised so the footer pattern (and any future tweak — column
 * count, link styling, social rows) lives in one place instead of
 * being duplicated across `(frontpage)`, `(public)`, `(user)`, and
 * `(admin)` layouts.
 */
export default async function SiteFooter() {
  const site = await getSiteSettings();

  return (
    <Footer.Classic dark siteTitle={site?.name} publisher={site?.publisher}>
      <List>
        {site?.footerLinks?.map((link, idx) => (
          <List.Item key={link.href ?? idx} className="mb-4">
            <Link href={link.href} className="hover:text-(--accent)">
              {link.text}
            </Link>
          </List.Item>
        ))}
      </List>
    </Footer.Classic>
  );
}
