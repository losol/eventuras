'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatPrice } from '@eventuras/core/currency';
import { formatDate, formatDateSpan } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ValueTile } from '@eventuras/ratio-ui/core/ValueTile';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { eventAdminHref } from '@/components/admin/shell';
import {
  EventDto,
  EventStatisticsDto,
  NotificationDto,
  RegistrationDto,
} from '@/lib/eventuras-sdk';

import { computeOrderStatistics, registrationTotal } from './orderStatistics';
import {
  formatRegistrationTime,
  getStatusBadgeStatus,
  getStatusLabels,
} from '../../registrations/Registration';

const LATEST_REGISTRATIONS = 5;
const LATEST_NOTIFICATIONS = 4;

type EventDashboardSectionProps = {
  eventinfo: EventDto;
  participants: RegistrationDto[];
  statistics: EventStatisticsDto;
  notifications: NotificationDto[];
};

/** Whole days from start to end, inclusive; undefined when either date is missing or unparsable. */
function durationInDays(start?: string | null, end?: string | null): number | undefined {
  if (!start || !end) return undefined;
  const ms = Date.parse(end) - Date.parse(start);
  if (Number.isNaN(ms) || ms < 0) return undefined;
  return Math.round(ms / 86_400_000) + 1;
}

function KeyFact({
  label,
  value,
  note,
  testId,
}: Readonly<{ label: string; value: string; note?: string; testId: string }>) {
  return (
    <Card border transparent testId={testId}>
      <Text
        as="p"
        family="mono"
        size="xs"
        variant="subtle"
        transform="uppercase"
        marginBottom="none"
      >
        {label}
      </Text>
      <ValueTile>
        <ValueTile.Value className="text-2xl">{value}</ValueTile.Value>
        {note && <ValueTile.Caption>{note}</ValueTile.Caption>}
      </ValueTile>
    </Card>
  );
}

function ListHeading({
  title,
  href,
  linkLabel,
}: Readonly<{ title: string; href: string; linkLabel: string }>) {
  return (
    <div className="flex items-center gap-3">
      <Text
        as="span"
        family="mono"
        size="xs"
        variant="muted"
        transform="uppercase"
        weight="semibold"
      >
        {title}
      </Text>
      <Link href={href} className="ml-auto text-sm">
        {linkLabel}
      </Link>
    </div>
  );
}

/**
 * The event's landing section: key facts, the latest registrations and the
 * latest notifications, each linking on to its full section.
 */
export default function EventDashboardSection({
  eventinfo,
  participants,
  statistics,
  notifications,
}: Readonly<EventDashboardSectionProps>) {
  const t = useTranslations();
  const locale = useLocale();
  const eventId = eventinfo.id!;

  const byStatus = statistics.byStatus;
  const activeCount = byStatus
    ? (byStatus.draft ?? 0) +
      (byStatus.verified ?? 0) +
      (byStatus.attended ?? 0) +
      (byStatus.finished ?? 0) +
      (byStatus.notAttended ?? 0)
    : participants.filter(p => p.status !== 'Cancelled' && p.status !== 'WaitingList').length;
  const waitingListCount =
    byStatus?.waitingList ?? participants.filter(p => p.status === 'WaitingList').length;

  const orders = useMemo(() => computeOrderStatistics(participants), [participants]);
  const statusLabels = useMemo(() => getStatusLabels(t), [t]);

  const latestRegistrations = useMemo(
    () =>
      [...participants]
        .sort((a, b) => (b.registrationTime ?? '').localeCompare(a.registrationTime ?? ''))
        .slice(0, LATEST_REGISTRATIONS),
    [participants]
  );
  const latestNotifications = useMemo(
    () =>
      [...notifications]
        .sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))
        .slice(0, LATEST_NOTIFICATIONS),
    [notifications]
  );

  const days = durationInDays(eventinfo.dateStart, eventinfo.dateEnd);
  const place = eventinfo.location || eventinfo.city || undefined;

  return (
    <Stack gap="xl">
      <Grid cols={{ sm: 2, md: 4 }}>
        <KeyFact
          testId="dashboard-registered"
          label={t('admin.events.overview.registered')}
          value={
            eventinfo.maxParticipants
              ? `${activeCount}/${eventinfo.maxParticipants}`
              : String(activeCount)
          }
          note={
            waitingListCount > 0
              ? t('admin.events.overview.waitingList', { count: waitingListCount })
              : undefined
          }
        />
        <KeyFact
          testId="dashboard-when"
          label={t('admin.events.overview.when')}
          value={
            eventinfo.dateStart
              ? formatDateSpan(eventinfo.dateStart, eventinfo.dateEnd, { locale })
              : t('admin.events.overview.noDate')
          }
          note={days ? t('admin.events.overview.days', { count: days }) : undefined}
        />
        <KeyFact
          testId="dashboard-where"
          label={t('admin.events.overview.where')}
          value={place ?? t('admin.events.overview.noLocation')}
          note={eventinfo.location && eventinfo.city ? eventinfo.city : undefined}
        />
        <KeyFact
          testId="dashboard-revenue"
          label={t('admin.events.overview.revenue')}
          value={formatPrice(orders.totalRevenue)}
          note={
            orders.draftOrders > 0
              ? t('admin.events.overview.draftOrders', { count: orders.draftOrders })
              : undefined
          }
        />
      </Grid>

      <Grid cols={{ sm: 1, md: 2 }}>
        <Stack gap="sm">
          <ListHeading
            title={t('admin.events.overview.latestRegistrations')}
            href={eventAdminHref(eventId, 'participants')}
            linkLabel={t('admin.events.overview.seeAll', { count: participants.length })}
          />
          <Card border transparent padding="none" testId="dashboard-latest-registrations">
            {latestRegistrations.length === 0 ? (
              <Text as="p" size="sm" variant="subtle" padding="md">
                {t('admin.events.overview.noRegistrations')}
              </Text>
            ) : (
              <ul className="divide-y divide-border-1">
                {latestRegistrations.map(registration => (
                  <li
                    key={registration.registrationId}
                    className="flex items-center gap-3 px-4 py-3 text-sm"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">{registration.user?.name}</span>
                      <span className="truncate font-mono text-xs text-(--text-subtle)">
                        {formatRegistrationTime(registration.registrationTime, locale)}
                      </span>
                    </span>
                    <Badge
                      variant="subtle"
                      status={getStatusBadgeStatus(registration.status ?? '')}
                    >
                      {statusLabels.find(s => s.value === registration.status)?.label ??
                        registration.status}
                    </Badge>
                    <span className="shrink-0 text-right font-mono text-xs text-(--text-muted)">
                      {formatPrice(registrationTotal(registration))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Stack>

        <Stack gap="sm">
          <ListHeading
            title={t('admin.events.overview.latestNotifications')}
            href={eventAdminHref(eventId, 'communication')}
            linkLabel={t('admin.events.overview.seeAll', { count: notifications.length })}
          />
          <Card border transparent padding="none" testId="dashboard-latest-notifications">
            {latestNotifications.length === 0 ? (
              <Text as="p" size="sm" variant="subtle" padding="md">
                {t('admin.notifications.noNotifications')}
              </Text>
            ) : (
              <ul className="divide-y divide-border-1">
                {latestNotifications.map(notification => (
                  <li key={notification.notificationId} className="flex flex-col gap-1 px-4 py-3">
                    <span className="flex items-center gap-2 font-mono text-xs text-(--text-subtle)">
                      <span>
                        {notification.created
                          ? formatDate(notification.created, { locale, showTime: true })
                          : ''}
                      </span>
                      <span className="text-(--text)">{notification.type}</span>
                      <span className="ml-auto">{notification.status}</span>
                    </span>
                    <span className="line-clamp-2 text-sm text-(--text-muted)">
                      {notification.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Stack>
      </Grid>
    </Stack>
  );
}
