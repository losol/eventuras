import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Timeline } from '@eventuras/ratio-ui/core/Timeline';

import { client } from '@/lib/eventuras-client';
import { BusinessEventDto, getV3BusinessEvents } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:admin:business-events',
  context: { component: 'BusinessEventsTimeline' },
});

type SubjectType = 'order' | 'registration' | 'user';

type Props = {
  subjectType: SubjectType;
  subjectUuid: string;
  /** Heading level for the section title. Defaults to h3. */
  headingAs?: 'h2' | 'h3' | 'h4';
};

/**
 * Admin-only timeline of BusinessEvents for a given subject. Server component
 * — fetches events via the SDK scoped to the current organisation; access
 * control is enforced server-side in `BusinessEventService.ListEventsAsync`
 * (SystemAdmin or member of the resolved org).
 */
export default async function BusinessEventsTimeline({
  subjectType,
  subjectUuid,
  headingAs = 'h3',
}: Props) {
  const t = await getTranslations();
  const orgId = getOrganizationId();

  const response = await getV3BusinessEvents({
    client,
    headers: { 'Eventuras-Org-Id': orgId },
    query: {
      SubjectType: subjectType,
      SubjectUuid: subjectUuid,
      Count: 50,
    },
  });

  if (response.error || !response.data) {
    logger.error(
      { subjectType, subjectUuid, error: response.error },
      'Failed to load business events'
    );
    return (
      <section className="mt-8">
        <Heading as={headingAs}>{t('admin.businessEvents.title')}</Heading>
        <Text>{t('admin.businessEvents.loadError')}</Text>
      </section>
    );
  }

  const events = response.data.data ?? [];

  return (
    <section className="mt-8">
      <Heading as={headingAs}>{t('admin.businessEvents.title')}</Heading>
      {events.length === 0 ? (
        <Text>{t('admin.businessEvents.empty')}</Text>
      ) : (
        <Timeline>
          {events.map((e, index) => (
            <Timeline.Item
              key={e.uuid ?? `${e.createdAt ?? 'unknown'}-${e.eventType ?? 'unknown'}-${index}`}
              timestamp={formatTimestamp(e.createdAt)}
              title={e.message ?? e.eventType ?? ''}
              actor={e.actorUserUuid ? <ActorLabel uuid={e.actorUserUuid} /> : undefined}
              status={statusForEventType(e.eventType)}
            >
              {renderMetadata(e)}
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </section>
  );
}

function formatTimestamp(instant: string | undefined): string {
  if (!instant) return '';
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return instant;
  return date.toLocaleString();
}

function statusForEventType(eventType: string | undefined) {
  if (!eventType) return 'neutral' as const;
  if (eventType.endsWith('.cancelled') || eventType.endsWith('.refunded'))
    return 'warning' as const;
  if (eventType.endsWith('.verified') || eventType.endsWith('.created')) return 'success' as const;
  if (eventType.endsWith('.invoiced')) return 'info' as const;
  return 'neutral' as const;
}

function ActorLabel({ uuid }: { uuid: string }) {
  // Resolving the user name requires an extra round-trip and is deferred to
  // a follow-up; for now, render the short uuid so admins can correlate.
  return <span className="font-mono text-xs">{uuid.slice(0, 8)}</span>;
}

function renderMetadata(event: BusinessEventDto) {
  if (event.metadata === undefined || event.metadata === null) {
    return null;
  }
  return (
    <details>
      <summary className="cursor-pointer text-xs text-neutral-500">metadata</summary>
      <pre className="mt-1 overflow-x-auto rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-900">
        {JSON.stringify(event.metadata, null, 2)}
      </pre>
    </details>
  );
}
