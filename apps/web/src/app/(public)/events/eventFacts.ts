import { formatDateSpan } from '@eventuras/core/datetime';

import type { Translator } from '@/app/(public)/events/eventStatusLabel';
import { EventDto } from '@/lib/eventuras-public-sdk';

export type EventFact = { label: string; value: string };

/** Date/location/deadline facts shown on the detail page and the registration card. */
export function getEventFacts(event: EventDto, t: Translator, locale: string): EventFact[] {
  const dates = event.dateStart
    ? formatDateSpan(event.dateStart as string, event.dateEnd as string, { locale })
    : '';
  const place = [event.location, event.city].filter(Boolean).join(', ');
  const deadline = event.lastRegistrationDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
        new Date(event.lastRegistrationDate as string)
      )
    : '';

  return [
    { label: t('common.events.detailspage.facts.date'), value: dates },
    { label: t('common.events.detailspage.facts.location'), value: place },
    { label: t('common.events.detailspage.facts.deadline'), value: deadline },
  ].filter(fact => fact.value);
}
