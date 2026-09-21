'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatDate, formatDateSpan } from '@eventuras/core/datetime';
import { Logger } from '@eventuras/logger';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Panel } from '@eventuras/ratio-ui/core/Panel';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { OrderDto, RegistrationDto, UserDto } from '@/lib/eventuras-sdk';
import { registrationBadgeStatus } from '@/utils/registration-helpers';

import { getUserOverview, type UserOverview } from './userActions';
import { useUserDetails } from './UserDetailsProvider';

const logger = Logger.create({
  namespace: 'web:admin:users',
  context: { component: 'UserDetailsDrawer' },
});

/** Status enums key their labels by lowering the first letter: NotAttended → notAttended. */
const labelKey = (status: string) => status.charAt(0).toLowerCase() + status.slice(1);

const orderBadgeStatus = (status?: OrderDto['status']) => {
  switch (status) {
    case 'Verified':
    case 'Invoiced':
      return 'success' as const;
    case 'Cancelled':
    case 'Refunded':
      return 'error' as const;
    default:
      return 'neutral' as const;
  }
};

/** A person's profile, registrations and orders — the questions support gets asked about someone. */
export function UserDetailsDrawer() {
  const t = useTranslations();
  const details = useUserDetails();
  const userId = details?.userId ?? null;
  const isOpen = userId !== null;
  // Tagged with the user it belongs to, so switching users can never show the previous
  // person's data for a render — and loading is derived rather than reset in the effect.
  const [loaded, setLoaded] = useState<{
    userId: string;
    overview?: UserOverview;
    failed?: boolean;
  } | null>(null);

  useEffect(() => {
    if (userId === null) {
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await getUserOverview(userId);
      if (cancelled) return;

      if (result.success) {
        setLoaded({ userId, overview: result.data });
      } else {
        logger.error({ userId, error: result.error }, 'Failed to load user overview');
        setLoaded({ userId, failed: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const current = loaded?.userId === userId ? loaded : null;
  const isLoading = isOpen && current === null;
  const overview = current?.overview ?? null;
  const failed = current?.failed ?? false;
  const user = overview?.user;

  return (
    <Drawer isOpen={isOpen} onClose={() => details?.close()} size="lg">
      <Drawer.Header as="h3">
        <span className="flex flex-wrap items-center gap-2">
          {user?.name || user?.email || t('admin.users.drawer.title')}
          {user?.archived && <Badge variant="subtle">{t('admin.users.drawer.archived')}</Badge>}
        </span>
      </Drawer.Header>
      <Drawer.Body>
        {isLoading && <Loading />}
        {!isLoading && failed && <Text color="error">{t('admin.users.drawer.loadFailed')}</Text>}
        {!isLoading && !failed && overview && user && (
          <div className="space-y-6">
            <PersonalDetails user={user} />
            <Registrations section={overview.registrations} />
            <Orders section={overview.orders} />
          </div>
        )}
      </Drawer.Body>
      <Drawer.Footer>
        {userId !== null && (
          <Link variant="button-outline" href={`/admin/users/${userId}`}>
            {t('admin.users.drawer.edit')}
          </Link>
        )}
      </Drawer.Footer>
    </Drawer>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <Heading as="h4" marginBottom="xs">
      {title}
    </Heading>
    {children}
  </section>
);

const Verified = ({ verified }: { verified?: boolean }) => {
  const t = useTranslations();
  return verified ? (
    <Badge variant="subtle" status="success">
      {t('admin.users.drawer.verified')}
    </Badge>
  ) : null;
};

function PersonalDetails({ user }: Readonly<{ user: UserDto }>) {
  const t = useTranslations();
  const locale = useLocale();
  const place = [user.zipCode, user.city].filter(Boolean).join(' ');
  const location = [place, user.country].filter(Boolean).join(', ');
  const work = [user.jobRole ?? user.profession, user.employer].filter(Boolean).join(', ');

  // Only what is filled in: a list of blank rows says nothing and pushes the rest down.
  const rows: { term: string; value: ReactNode }[] = [
    { term: t('admin.users.drawer.fields.email'), value: user.email },
    { term: t('admin.users.drawer.fields.phone'), value: user.phoneNumber },
    {
      term: t('admin.users.drawer.fields.birthDate'),
      value: user.birthDate && (
        <span className="flex flex-wrap items-center gap-2">
          {formatDate(user.birthDate, { locale })}
          <Verified verified={user.birthDateVerified} />
        </span>
      ),
    },
    { term: t('admin.users.drawer.fields.location'), value: location },
    { term: t('admin.users.drawer.fields.work'), value: work },
    {
      term: t('admin.users.drawer.fields.professionalId'),
      value: user.professionalIdentityNumber && (
        <span className="flex flex-wrap items-center gap-2">
          {user.professionalIdentityNumber}
          <Verified verified={user.professionalIdentityNumberVerified} />
        </span>
      ),
    },
    { term: t('admin.users.drawer.fields.notes'), value: user.supplementaryInformation },
  ].filter(row => Boolean(row.value));

  return (
    <Section title={t('admin.users.drawer.personalDetails')}>
      <DescriptionList>
        {rows.map(row => (
          <DescriptionList.Description key={row.term} term={row.term}>
            {row.value}
          </DescriptionList.Description>
        ))}
      </DescriptionList>
    </Section>
  );
}

function Registrations({ section }: Readonly<{ section: UserOverview['registrations'] }>) {
  const t = useTranslations();
  const title = t('admin.users.drawer.registrations');

  if (section === null) {
    return (
      <Section title={title}>
        <Panel status="warning">{t('admin.users.drawer.loadFailed')}</Panel>
      </Section>
    );
  }

  return (
    <Section title={`${title} (${section.total})`}>
      {section.items.length === 0 ? (
        <Text>{t('admin.users.drawer.noRegistrations')}</Text>
      ) : (
        <ul className="space-y-2">
          {section.items.map(registration => (
            <RegistrationRow key={registration.registrationId} registration={registration} />
          ))}
        </ul>
      )}
      <ShownOf shown={section.items.length} total={section.total} />
    </Section>
  );
}

function RegistrationRow({ registration }: Readonly<{ registration: RegistrationDto }>) {
  const t = useTranslations();
  const locale = useLocale();
  const event = registration.event;
  const dates = event?.dateStart
    ? formatDateSpan(event.dateStart, event.dateEnd ?? null, { locale })
    : null;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2">
      <span>
        {event?.id ? (
          <Link href={`/admin/events/${event.id}`}>{event.title}</Link>
        ) : (
          (event?.title ?? `#${registration.registrationId}`)
        )}
        {dates && <span className="block text-sm">{dates}</span>}
      </span>
      {registration.status && (
        <Badge variant="subtle" status={registrationBadgeStatus(registration.status)}>
          {t(`common.registrations.labels.${labelKey(registration.status)}`)}
        </Badge>
      )}
    </li>
  );
}

function Orders({ section }: Readonly<{ section: UserOverview['orders'] }>) {
  const t = useTranslations();
  const locale = useLocale();
  const title = t('admin.users.drawer.orders');

  if (section === null) {
    return (
      <Section title={title}>
        <Panel status="warning">{t('admin.users.drawer.loadFailed')}</Panel>
      </Section>
    );
  }

  return (
    <Section title={`${title} (${section.total})`}>
      {section.items.length === 0 ? (
        <Text>{t('admin.users.drawer.noOrders')}</Text>
      ) : (
        <ul className="space-y-2">
          {section.items.map(order => (
            <li key={order.orderId} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <Link href={`/admin/orders/${order.orderId}`}>#{order.orderId}</Link>
                {order.time && (
                  <span className="block text-sm">
                    {formatDate(order.time, { locale, showTime: true })}
                  </span>
                )}
              </span>
              {order.status && (
                <Badge variant="subtle" status={orderBadgeStatus(order.status)}>
                  {t(`common.order.status.labels.${labelKey(order.status)}`)}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
      <ShownOf shown={section.items.length} total={section.total} />
    </Section>
  );
}

/** Said only when the list is cut short, so a long history isn't mistaken for a complete one. */
const ShownOf = ({ shown, total }: { shown: number; total: number }) => {
  const t = useTranslations();
  return shown < total ? (
    <Text className="mt-2 text-sm">{t('admin.users.drawer.shownOf', { shown, total })}</Text>
  ) : null;
};
