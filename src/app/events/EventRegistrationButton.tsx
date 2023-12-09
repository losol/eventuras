import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/ui/Link';

export type EventRegistrationButtonProps = {
  eventId: string | number;
};

export default function EventRegistrationButton({ eventId }: EventRegistrationButtonProps) {
  const { t } = createTranslation();

  return (
    <Link
      href={`/user/events/${eventId}/registration`}
      variant="button-primary"
      block
      data-test-id="event-registration-button"
    >
      {t('common:buttons.register-cta')}
    </Link>
  );
}
