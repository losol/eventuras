import { getLocale, getTranslations } from 'next-intl/server';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import type { Status } from '@eventuras/ratio-ui/tokens';

import { getEventFacts } from '@/app/(public)/events/eventFacts';
import EventRegistrationButton from '@/app/(public)/events/EventRegistrationButton';
import { eventStatusLabel } from '@/app/(public)/events/eventStatusLabel';
import { EventDto, EventInfoStatus } from '@/lib/eventuras-public-sdk';

export type EventRegistrationCardProps = {
  event: EventDto;
};

const badgeStatusByEventStatus: Partial<Record<EventInfoStatus, Status>> = {
  [EventInfoStatus.REGISTRATIONS_OPEN]: 'success',
  [EventInfoStatus.WAITING_LIST]: 'warning',
  [EventInfoStatus.PLANNED]: 'info',
  [EventInfoStatus.CANCELLED]: 'error',
};

/**
 * Sticky aside card for the event detail page — status chip, key facts,
 * and the registration CTA when registrations are open.
 */
export default async function EventRegistrationCard({
  event,
}: Readonly<EventRegistrationCardProps>) {
  const t = await getTranslations();
  const locale = await getLocale();

  const canRegister = event.status === EventInfoStatus.REGISTRATIONS_OPEN;
  const facts = getEventFacts(event, t, locale);

  return (
    <Card padding="md" testId="event-registration-card">
      <div className="flex items-baseline justify-between gap-4">
        <Heading as="h2" size="sm">
          {t('common.events.detailspage.registration')}
        </Heading>
        {event.status && (
          <Badge variant="subtle" status={badgeStatusByEventStatus[event.status] ?? 'neutral'}>
            {eventStatusLabel(t, event.status)}
          </Badge>
        )}
      </div>

      {facts.length > 0 && (
        <DescriptionList variant="meta" className="mt-4 mb-4">
          {facts.map(fact => (
            <DescriptionList.Description key={fact.label} term={fact.label}>
              {fact.value}
            </DescriptionList.Description>
          ))}
        </DescriptionList>
      )}

      {canRegister && <EventRegistrationButton event={event} />}
    </Card>
  );
}
