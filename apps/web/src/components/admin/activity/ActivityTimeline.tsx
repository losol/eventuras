'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatDate } from '@eventuras/core/datetime';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Timeline } from '@eventuras/ratio-ui/core/Timeline';

import type { BusinessEventDto } from '@/lib/eventuras-sdk';

import { statusForEventType } from './businessEventPresentation';

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
          title={event.message ?? event.eventType ?? ''}
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
