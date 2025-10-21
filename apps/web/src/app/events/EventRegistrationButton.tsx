import { EventDto, EventInfoStatus } from '@eventuras/sdk';
import { Badge } from '@eventuras/ratio-ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import { Link } from '@eventuras/ratio-ui/next/Link';

export type EventRegistrationButtonProps = {
  event: EventDto;
};

export default async function EventRegistrationButton({ event }: EventRegistrationButtonProps) {
  const t = await getTranslations();
  const canRegister = event.status === EventInfoStatus.REGISTRATIONS_OPEN;

  const getStatusText = (status: EventInfoStatus): string => {
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
  };

  if (canRegister) {
    return (
      <Link
        href={`/user/events/${event.id}`}
        variant="button-primary"
        block
        {...{ [DATA_TEST_ID]: 'event-registration-button' }}
      >
        {t('common.buttons.register-cta')}
      </Link>
    );
  } else {
    return <Badge block>{getStatusText(event.status!)}</Badge>;
  }
}
