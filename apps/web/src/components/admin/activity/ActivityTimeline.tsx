'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatDate } from '@eventuras/core/datetime';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Timeline } from '@eventuras/ratio-ui/core/Timeline';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { BusinessEventDto } from '@/lib/eventuras-sdk';

import { actorLabel, statusForEventType, subjectHref } from './businessEventPresentation';

type ActivityTimelineProps = {
  events: BusinessEventDto[];
  testId?: string;
};

/** The shared rendering of business events — used by the drawer and the overview. */
export function ActivityTimeline({ events, testId }: Readonly<ActivityTimelineProps>) {
  const t = useTranslations();
  const locale = useLocale();

  if (events.length === 0) {
    return (
      <Text as="p" size="sm" variant="subtle" testId={testId}>
        {t('admin.businessEvents.empty')}
      </Text>
    );
  }

  return (
    <Timeline testId={testId}>
      {events.map((event, index) => (
        <Timeline.Item
          key={event.uuid ?? `${event.createdAt}-${index}`}
          timestamp={event.createdAt ? formatDate(event.createdAt, { locale, showTime: true }) : ''}
          title={<ActivityTitle event={event} />}
          actor={actorLabel(event)}
          status={statusForEventType(event.eventType)}
        >
          <Text as="span" family="mono" size="xs" variant="subtle">
            {event.eventType}
          </Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

/** "Ola Nordmann · Status changed …", with the name linking to the subject. */
function ActivityTitle({ event }: Readonly<{ event: BusinessEventDto }>) {
  const message = event.message || event.eventType || '';
  if (!event.subjectName) return <>{message}</>;

  const href = subjectHref(event);
  return (
    <>
      {href ? <Link href={href}>{event.subjectName}</Link> : event.subjectName}
      {' · '}
      {message}
    </>
  );
}
