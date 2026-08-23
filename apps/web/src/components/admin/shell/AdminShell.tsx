'use client';

import { type ReactNode, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { ActionButton } from '@eventuras/ratio-ui/core/ActionButton';
import { MenuIcon } from '@eventuras/ratio-ui/icons';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Sidebar } from '@eventuras/ratio-ui/layout/Sidebar';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { AdminNav } from './AdminNav';
import { PinnedEventProvider } from './PinnedEvent';
import { ActivityDrawer, ActivityDrawerProvider } from '../activity';

export interface AdminShellProps {
  children: ReactNode;
  /** Sidebar header text, e.g. "Admin". */
  title: string;
  menuLabel: string;
}

/**
 * The admin chrome: a sticky sidebar with the admin navigation on large
 * screens, the same navigation in a left drawer below that. The page content
 * renders beside it. The sidebar sticks to the viewport top once the site
 * navbar scrolls away, so it needs no offset.
 */
export function AdminShell({ children, title, menuLabel }: Readonly<AdminShellProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The drawer stays open only for the URL it was opened on, so it closes
  // itself once a navigation from inside it lands.
  const location = `${pathname}?${searchParams.toString()}`;
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const drawerOpen = openedAt === location;

  const header = (
    <Link href="/admin" className="block px-3 font-serif text-lg font-semibold no-underline">
      {title}
    </Link>
  );

  return (
    <PinnedEventProvider>
      <ActivityDrawerProvider>
        <div className="flex items-start">
          <Sidebar aria-label={title} width={256} className="hidden lg:flex" testId="admin-sidebar">
            <Sidebar.Header>{header}</Sidebar.Header>
            <Sidebar.Body>
              <AdminNav />
            </Sidebar.Body>
          </Sidebar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 border-b border-border-1 px-3 py-2 lg:hidden">
              <ActionButton round ariaLabel={menuLabel} onPress={() => setOpenedAt(location)}>
                <MenuIcon size={18} />
              </ActionButton>
              {header}
            </div>
            <main id="main-content">{children}</main>
          </div>
        </div>

        <Drawer isOpen={drawerOpen} onClose={() => setOpenedAt(null)} side="left">
          <Drawer.Header as="h2">{title}</Drawer.Header>
          <Drawer.Body>
            <AdminNav />
          </Drawer.Body>
        </Drawer>

        <ActivityDrawer />
      </ActivityDrawerProvider>
    </PinnedEventProvider>
  );
}
