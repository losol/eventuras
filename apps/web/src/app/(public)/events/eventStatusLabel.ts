import type { getTranslations } from 'next-intl/server';

import { EventInfoStatus } from '@/lib/eventuras-public-sdk';

type Translator = Awaited<ReturnType<typeof getTranslations>>;

/** Localized label for an event status, e.g. "Påmelding åpen". */
export function eventStatusLabel(t: Translator, status?: EventInfoStatus | null): string {
  switch (status) {
    case EventInfoStatus.DRAFT:
      return t('common.events.labels.status.draft');
    case EventInfoStatus.PLANNED:
      return t('common.events.labels.status.planned');
    case EventInfoStatus.REGISTRATIONS_OPEN:
      return t('common.events.labels.status.registrationsOpen');
    case EventInfoStatus.WAITING_LIST:
      return t('common.events.labels.status.waitingList');
    case EventInfoStatus.REGISTRATIONS_CLOSED:
      return t('common.events.labels.status.registrationsClosed');
    case EventInfoStatus.FINISHED:
      return t('common.events.labels.status.finished');
    case EventInfoStatus.ARCHIVED:
      return t('common.events.labels.status.archived');
    case EventInfoStatus.CANCELLED:
      return t('common.events.labels.status.cancelled');
    default:
      return t('common.events.labels.status.unknown');
  }
}
