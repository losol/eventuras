import { getLocale, getTranslations } from 'next-intl/server';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import type { Status } from '@eventuras/ratio-ui/tokens';

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

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <dt className="font-mono text-xs uppercase tracking-widest text-(--text-subtle)">{label}</dt>
    <dd className="text-sm text-(--text) text-right m-0">{value}</dd>
  </div>
);

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

  const dates = formatDateSpan(event.dateStart as string, event.dateEnd as string, { locale });
  const place = [event.location, event.city].filter(Boolean).join(', ');
  const deadline = event.lastRegistrationDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
        new Date(event.lastRegistrationDate as string)
      )
    : '';

  return (
    <Card padding="md" testId="event-registration-card">
      <div className="flex items-baseline justify-between gap-4">
        <Heading as="h2" className="font-serif font-medium text-xl tracking-tight m-0">
          {t('common.events.detailspage.registration')}
        </Heading>
        {event.status && (
          <Badge variant="subtle" status={badgeStatusByEventStatus[event.status] ?? 'neutral'}>
            {eventStatusLabel(t, event.status)}
          </Badge>
        )}
      </div>

      {(dates || place || deadline) && (
        <dl className="mt-4 mb-4 border-t border-b border-(--border-1) py-3 flex flex-col gap-2">
          {dates && <MetaRow label={t('common.events.detailspage.facts.date')} value={dates} />}
          {place && <MetaRow label={t('common.events.detailspage.facts.location')} value={place} />}
          {deadline && (
            <MetaRow label={t('common.events.detailspage.facts.deadline')} value={deadline} />
          )}
        </dl>
      )}

      {canRegister && <EventRegistrationButton event={event} />}
    </Card>
  );
}
