'use client';

import type { ComponentProps } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ActionButton } from '@eventuras/ratio-ui/core/ActionButton';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Chip } from '@eventuras/ratio-ui/core/Chip';
import { NavTree, type NavTreeItem, type NavTreeProps } from '@eventuras/ratio-ui/core/NavTree';
import { X } from '@eventuras/ratio-ui/icons';

import {
  DEFAULT_EVENT_ADMIN_TAB,
  EVENT_ADMIN_SECTIONS,
  eventAdminHref,
  type EventAdminTab,
  isEventAdminTab,
  sectionForTab,
} from './eventAdminSections';
import { usePinnedEvent } from './PinnedEvent';
import { useActivityDrawer } from '../activity';

// Plain next/link, not ratio-ui's Link: NavTree owns the row styling and passes style/aria props its LinkProps don't type.
const NavLink: NonNullable<NavTreeProps['LinkComponent']> = ({ href, ...rest }) => (
  <NextLink href={href} {...rest} />
);

const EVENT_PATH = /^\/admin\/events\/(\d+)(?:\/|$)/;

/**
 * Resolves the path NavTree should treat as current: the event section when
 * inside the pinned event (its product subpages count as the products
 * section), otherwise the top-level admin area (`/admin/users/42` → `/admin/users`).
 */
function currentNavPath(pathname: string, tab: string | null, pinnedEventId: number | undefined) {
  const eventMatch = EVENT_PATH.exec(pathname);
  if (eventMatch && pinnedEventId !== undefined && Number(eventMatch[1]) === pinnedEventId) {
    const subpage = pathname.slice(eventMatch[0].length);
    let current: EventAdminTab = DEFAULT_EVENT_ADMIN_TAB;
    if (subpage.startsWith('products')) current = 'products';
    else if (isEventAdminTab(tab)) current = tab;
    return eventAdminHref(pinnedEventId, sectionForTab(current).tab);
  }
  const [, admin, area] = pathname.split('/');
  return area ? `/${admin}/${area}` : `/${admin}`;
}

export function AdminNav(props: Readonly<Pick<ComponentProps<typeof NavTree>, 'className'>>) {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { event, unpin } = usePinnedEvent();
  const activity = useActivityDrawer();

  const closeEvent = () => {
    unpin();
    if (event && EVENT_PATH.exec(pathname)?.[1] === String(event.id)) router.push('/admin/events');
  };

  const eventChildren: NavTreeItem[] | undefined = event
    ? [
        {
          id: 'pinned-event',
          content: (
            <div className="flex items-start gap-2 py-0.5">
              <span className="min-w-0 flex-1 font-mono text-xs leading-tight text-(--text-muted) break-words">
                {event.title}
              </span>
              <ActionButton
                size="sm"
                variant="ghost"
                ariaLabel={t('admin.nav.closeEvent')}
                onPress={closeEvent}
                testId="admin-nav-close-event"
              >
                <X size={14} />
              </ActionButton>
            </div>
          ),
        },
        ...EVENT_ADMIN_SECTIONS.map<NavTreeItem>(section => ({
          title: t(section.labelKey),
          href: eventAdminHref(event.id, section.tab),
          trailing:
            section.key === 'participants' && event.participantCount !== undefined ? (
              <Chip variant="outline" className="font-mono text-[11px]">
                {event.participantCount}
              </Chip>
            ) : undefined,
        })),
        {
          id: 'pinned-event-activity',
          content: (
            <Button
              variant="outline"
              size="sm"
              block
              onClick={activity.open}
              testId="admin-nav-activity"
            >
              {t('admin.businessEvents.title')}
            </Button>
          ),
        },
      ]
    : undefined;

  return (
    <NavTree
      aria-label={t('admin.nav.ariaLabel')}
      className={props.className}
      LinkComponent={NavLink}
      currentPath={currentNavPath(pathname, searchParams.get('tab'), event?.id)}
      groups={[
        {
          items: [
            {
              title: t('admin.nav.events'),
              href: '/admin/events',
              children: eventChildren,
              defaultOpen: !!event,
            },
            { title: t('admin.labels.users'), href: '/admin/users' },
            { title: t('admin.labels.orders'), href: '/admin/orders' },
            { title: t('admin.labels.registrations'), href: '/admin/registrations' },
            { title: t('admin.labels.collections'), href: '/admin/collections' },
          ],
        },
        {
          items: [
            { title: t('admin.organizations.page.title'), href: '/admin/organizations' },
            { title: t('admin.nav.system'), href: '/admin/system' },
          ],
        },
      ]}
    />
  );
}
