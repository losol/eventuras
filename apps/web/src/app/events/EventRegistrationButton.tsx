import { EventDto, EventInfoStatus } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/ui/Link';

export type EventRegistrationButtonProps = {
  event: EventDto;
};

export default function EventRegistrationButton({ event }: EventRegistrationButtonProps) {
  const { t } = createTranslation();
  const canRegister = event.status === EventInfoStatus.REGISTRATIONS_OPEN;
  const link = (
    <Link
      href={`/user/events/${event.id}`}
      variant="button-primary"
      block
      data-test-id="event-registration-button"
    >
      {t('common:buttons.register-cta')}
    </Link>
  );

  return canRegister ? link : <span>{t('common:buttons.registration-not-open')}</span>;
}
